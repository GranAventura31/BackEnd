const express = require('express')
const routes = express.Router()
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const Stripe = require('stripe')

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


// routes.get('/Login', (req, res) => {
//     const correo = req.body.correo;
//     const contrasena = req.body.contrasena;
//     req.getConnection((err,conn) =>{
//         if (err) {
//             return res.send(err)
//         }else {conn.query('SELECT * FROM registro WHERE Correo = ? AND Contrasena = ?',[correo,contrasena], (err, rows) => {
//             // if(err) return res.send(err)

//             res.json(rows)
//         })}
//     })
// })

// routes.post('/Register', (req, res) => {

//     const nombre = req.body.nombre;
//     const correo = req.body.correo;
//     const contrasena = req.body.contrasena;
//     const telefono = req.body.telefono;
//     const rol = req.body.rol="Usuario";
//     req.getConnection((err,conn) =>{
//         if (err) return res.send(err)
//         conn.query('insert into registro (Nombre, Correo, Contrasena, Rol,Telefono) values (?,?,?,?,?)',[nombre,correo,contrasena,rol,telefono], (err, rows) => {
//             if(err) return res.send(err)

//             res.send({'response':'User Inserted'})
//         })
//     })
// })
routes.post('/Register', (req, res) => {

    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const contrasena = req.body.contrasena;
    const rol = req.body.rol="Usuario";
    const telefono = req.body.telefono;
    req.getConnection((err,conn) =>{
        if (err) return res.send(err)
        conn.query('CALL registroUsuario(?,?,?,?,?)',[nombre,correo,contrasena,rol,telefono], (err, rows) => {
            if(err) return res.send(err)

            res.send({'response':'User Inserted'})
        })
    })
})

routes.post('/reserva', (req, res) => {

    const correo = req.body.correo;
    const nombre = req.body.nombre;
    const telefono = req.body.telefono;
    const colegio = req.body.colegio;
    const pay = req.body.pay;
    req.getConnection((err,conn) =>{
        if (err) return res.send(err)
        conn.query('CALL reservaUsuario(?,?,?,?,?)',[correo,nombre,telefono,colegio,pay,], (err, rows) => {
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
        description: "Gaming Keyboard",
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

            res.send({'response':'User updated'})
        })
    })
})

module.exports = routes