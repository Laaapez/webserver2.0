const { response } = require('express');
const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const app = express();


app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, [
        'nombre',
        'email',
        'img',
        'role',
        'estado'
    ]);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.delete('/usuario/:id', function(req, res) { //Esto cambia el estado a falso
    let id = req.params.id;
    let Estado = {
        estado: false
    };
    Usuario.findByIdAndUpdate(id, Estado, { new: true }, (err, UsuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!UsuarioBorrado) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: UsuarioBorrado
        });
    })
});




// app.delete('/usuario/:id', function(req, res) {  //Esto elimina totalmente un dato, no es conveniente pero no esta demas
// let id = req.params.id;
// Usuario.findByIdAndRemove(id, (err, UsuarioBorrado) => {
// if (err) {
// return res.status(400).json({
// ok: false,
// err
// });
// }
// if (!UsuarioBorrado) {
// return res.status(400).json({
// ok: false,
// error: {
// message: 'Usuario no encontrado'
// }
// });
// }
// res.json({
// ok: true,
// usuario: UsuarioBorrado
// });
// })
// });

app.get('/usuario', function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img') //dentro de la llave del parentesis va la condición que puede cumplir el find, despues de la coma se pueden definir los campos para mostrar
        .skip(desde) //se salta los primeros registros hasta el registro "desde"
        .limit(limite) //muestra primeros "limite" registros
        .exec((err, usuarios) => {
            if (err) {
                ok: false,
                err
            }

            Usuario.count({ estado: true }, (err, conteo) => { //condicion en find, condicion que se pone aca ojo
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo,
                });
            })

        });

    // res.json('get Usuario LOCAL!!!');
});

app.post('/usuario', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });
    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

    //if (body.nombre === undefined) {

    //res.status(400).json({
    //ok: false,
    //mensaje: 'El nombre es necesario'
    //});

    //} else {
    //res.json({
    //persona: body
    //});
    //}
});

module.exports = app;