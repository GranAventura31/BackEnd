const express = require('express')
const routes = express.Router()
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const Stripe = require('stripe')
const multer = require('multer');

routes.get('/', (req, res) => {
    req.getConnection((err,conn) =>{
        if (err) return res.send(err)

        conn.query('SELECT * FROM registro', (err, rows) => {
            if(err) return res.send(err)

            res.json(rows)
        })
    })
})
routes.get('/reserva', (req, res) => {
    req.getConnection((err,conn) =>{
        if (err) return res.send(err)

        conn.query('SELECT * FROM reserva', (err, rows) => {
            if(err) return res.send(err)

            res.json(rows)
        })
    })
})

routes.post('/Login', (req, res) => {
    const correo = req.body.Correo;
    const contrasena = req.body.Contrasena;
    req.getConnection((err, conn) => {
        if (err) {
            return res.send(err);
        } else {
            conn.query('SELECT * FROM registro WHERE Correo = ? AND Contrasena = ?', [correo, contrasena], (err, rows) => {
                if (err) {
                    return res.send(err);
                }
                if (rows.length === 0) {
                    return res.status(404).send('No se encontraron datos');
                }
                res.status(200).send(rows);
            });
        }
    });
});

routes.get('/Perfil', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            return res.send(err);
        } else {
            conn.query('SELECT * FROM registro', (err, rows) => {
                if (err) {
                    return res.send(err);
                }
                res.send(rows);
            });
        }
    });
});
routes.post('/ActualizarPerfil', (req, res) => {
    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const contrasena = req.body.contrasena;
    const telefono = req.body.telefono;
    const CorreoActual = req.body.CorreoActual;
    req.getConnection((err, conn) => {
        if (err) return res.send(err)
        conn.query('UPDATE registro SET Nombre = ?, Correo = ?, Contrasena = ?, Telefono = ? WHERE Correo = ?', [nombre, correo, contrasena, telefono, CorreoActual], (err, rows) => {
            if (err) return res.send(err)

            res.send({ 'response': 'User Updated' })
        })
    })
})

routes.post('/Register', (req, res) => {
    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const contrasena = req.body.contrasena;
    const telefono = req.body.telefono;
    const rol = req.body.rol || "Usuario";

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ error: 'Error de conexión a la base de datos' });
        }

        // Validar si el correo o el teléfono ya existen en la base de datos
        conn.query('SELECT * FROM registro WHERE Correo = ? OR Telefono = ?', [correo, telefono], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error al consultar la base de datos' });
            }

            if (rows.length > 0) {
                // Ya existe un registro con el mismo correo o teléfono
                return res.status(409).json({ error: 'Correo o teléfono ya existen' });
            }

            // Insertar el nuevo usuario en la base de datos
            conn.query('INSERT INTO registro (Nombre, Correo, Contrasena, Rol, Telefono) VALUES (?, ?, ?, ?, ?)', [nombre, correo, contrasena, rol, telefono], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al insertar el usuario en la base de datos' });
                }

                return res.status(200).json({ response: 'Usuario insertado' });
            });
        });
    });
});


routes.post('/reserva', (req, res) => {

    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const telefono = req.body.telefono;
    const paquete = req.body.paquete;
    
    req.getConnection((err,conn) =>{
        if (err) return res.send(err)
        conn.query('INSERT INTO reserva (Nombre, Correo, Telefono, Paquete)  VALUES (?, ?, ?, ?);',[nombre, correo, telefono, paquete], (err, rows) => {
            if(err) return res.send(err)

            res.send({'response':'User Inserted'})
        })
    })
})

routes.post('/ActualizarContrasena', async(req, res) => {
    const generateRandom = () => {
    const password = crypto.randomBytes(4).toString('hex');
    return password;
}

    const correo = req.body.correo;
    let contrasenaNueva = String(generateRandom());

    let config ={
    host : 'smtp.gmail.com',
    port : 587,
    auth : {
        user: 'granaventura86@gmail.com',
        pass: 'vyaofmvtkmnvlzoc'
    }
    }
    let mensaje = {
        from : 'granaventura@gmail.com',
        to : correo,
        subject : 'GranAventura \nRecuperación de Contraseña.',
        text : '¿Hola, has olvidado tu contraseña? \nPara ingresar a tu cuenta deberas usar esta contraseña: '+contrasenaNueva+'\n\nCuando ingreses no olvides cambiar tu contraseña a una nueva contraseña que no olvides.'
    }

    const transport = nodemailer.createTransport(config);

    const info = await transport.sendMail(mensaje);

    console.log(info);

    req.getConnection((err,conn) =>{
        if (err) return res.send(err)
        conn.query('UPDATE registro set Contrasena = ? WHERE Correo = ?',[contrasenaNueva,correo], (err, rows) => {
            if(err) return res.send(err)

            res.send({'response':'User Inserted'})
        })
    })
})

routes.delete('/:id', (req, res) => {
    req.getConnection((err,conn) =>{
        if (err) return res.send(err)
        
        conn.query('delete from registro where contrasena = ?',[req.params.id], (err, rows) => {
            if(err) return res.send(err)

            res.send({'response':'User excluded'})
        })
    })
})

routes.put('/:id', (req, res) => {
    req.getConnection((err,conn) =>{
        if (err) return res.send(err)
        
        conn.query('UPDATE registro set ? where Contrasena = ?',[req.body,req.params.id], (err, rows) => {
            if(err) return res.send(err)

            res.send({'response':'User updated'})
        })
    })
})

const stripe = new Stripe("sk_test_51NBLwlHRmqMvRqXdEsPinf0NTFIoz8E6puhnDJciR3kMYYdjsD5Vm4EoBn94yc7jUhBAk7ntedTdOKs5HnLL0fDs00Fwv0aXAn"); 

routes.post('/checkout', async (req, res) => {
    try {
    const { id, amount } = req.body 

    const payment = await stripe.paymentIntents.create({
        amount,
        currency: 'USD',
        description: "Kit Gran Aventura",
        payment_method: id,
        confirm: true 
    });

    console.log(payment);


    res.send({message: 'Succesfull payment'})
    } catch (error) {
        console.log(error);
        res.json({message: error})
    }
    // console.log(req.body);
    // res.send('received')
})


// CARRUSEL
routes.post('/carrusel', (req, res) => {

    const imagen = req.body.imagen;
    const nit = req.body.nit;
    req.getConnection((err,conn) =>{
        if (err) return res.send(err)
        conn.query('CALL ingresarCarrusel(?,?)',[nit,imagen], (err, rows) => {
            if(err) return res.send(err)

            res.send({'response':'User Inserted'})
        })
    })
})

routes.post('/upcarrusel', (req, res) => {
    const imagen = req.body.imagen;
    const nit = req.body.nit;

    req.getConnection((err,conn) =>{
        if (err) return res.send(err)
        
        conn.query('CALL actualizarCarrusel(?,?)',[imagen,nit], (err, rows) => {
            if(err) return res.send(err)

            res.status(200).send(rows)
        })
    })
})



routes.get('/comentarios', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err);

        conn.query('SELECT * FROM comentario', (error, rows) => {
            if (error) {
                console.error('Error al obtener los comentarios:', error);
                res.status(500).json({ error: 'Error al obtener los comentarios' });
            } else {
                res.status(200).json(rows);
            }
        });
    });
});


routes.post('/comentarios', (req, res) => {
    const image = req.body.Image;
    const nombre = req.body.Nombre;
    const comentario = req.body.Comentario;

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error al establecer la conexión:', err);
            return res.status(500).json({ error: 'Error al establecer la conexión' });
        }
        
        conn.query('INSERT INTO comentario (Imagen,Nombre, Comentario) VALUES (?, ?, ?)', [image,nombre,comentario], (err, rows) => {
            if (err) {
                console.error('Error al agregar el comentario:', err);
                return res.status(500).json({ error: 'Error al agregar el comentario' });
            } else {
                res.status(200).json({ success: true, rows });
            }
        });
    });
});

// Configuración de Multer para almacenar los archivos en la carpeta 'uploads'
// routes.post('/archivos', (req, res) => {
//   const { titulo, ruta } = req.body;

//   // Insertar los datos en la tabla
//   const query = 'INSERT INTO archivos (titulo, ruta) VALUES (?, ?)';
//   connection.query(query, [titulo, ruta], (error, results) => {
//     if (error) {
//       console.error('Error al agregar el archivo:', error);
//       res.status(500).send('Error al agregar el archivo');
//     } else {
//       console.log('Archivo agregado correctamente');
//       res.status(200).send('Archivo agregado correctamente');
//     }
//   });
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const uploadStorage = multer({ storage: storage })

// Single file
routes.post("/upload/single", uploadStorage.single("file"), (req, res) => {
  console.log(req.file)
  return res.send("Single file")
})
//Multiple files
routes.post("/upload/multiple", uploadStorage.array("file", 10), (req, res) => {
  console.log(req.files)
  return res.send("Multiple files")
})

module.exports = routes