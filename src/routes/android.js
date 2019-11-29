const express = require('express');
const app = express();
const router = express.Router();

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

const mysqlConnection = require('../database');

/*--------------------------------------------------GET METHODS for Android application ---------------------------------------------*/

//Iniciar Sesion al sistema
router.get("/app/loginUsuario", function(req, res){

    var idUsuario = req.query.idUsuario;
    var password = req.query.password;

    const query = `
    select * from usuarios inner join empleados on usuarios.empleado = empleados.idEmpleado where idUsuario = ? and pass = ?;
    `;

    mysqlConnection.query(query, [idUsuario, password],(err, rows, fields)=>{
        if(!err){
            if(rows[0]){
                res.json({user: rows[0].idUsuario
                        ,nombre: rows[0].nombre
                        ,idEmpleado: rows[0].idEmpleado});
            }else{
                res.json({error:true
                        ,message: "error de usuario/contraseña"})
            }
        }else{
            console.log(err)
        }
    });
});

//Obtener lista de ordenes de produccion
router.get("/app/obtenerOrdenesProdDeSupervisor", (req, res)=>{
    var idSupervisor = req.query.idSupervisor;

    const query = `
    select * from ordenes_prod
    inner join ordenes_compra on ordenes_prod.orden_compra = ordenes_compra.idOrdenCompra
    inner join productos on ordenes_prod.orden_compra = productos.idProducto
    where supervisor = ?;
    `;

    mysqlConnection.query(query,[idSupervisor], (err, rows, fields)=>{
        if(!err){
            if(rows[0]){
                var ordenes_activas = []
                for(var i = 0; i<rows.length;i++){
                    if(rows[i].fechaHora_salida === null){
                        ordenes_activas.push(rows[i])
                    }
                }
                res.json(ordenes_activas);
            }else{
                res.json({error:true
                        ,message: "error, verifique los datos de supervisor"})
            }
        }else{
            console.log(err)
        }
    });
});

//Obtener ordenes de compra
router.get("/app/obtenerOrdenesDeSupervisor", (req, res)=>{
    var idSupervisor = req.query.idSupervisor;

    const query = `
    select * from ordenes_compra 
    inner join productos on ordenes_compra.producto = productos.idProducto
    where supervisor = ? and estado = "EN PROCESO";
    `;

    mysqlConnection.query(query,[idSupervisor], (err, rows, fields)=>{
        if(!err){
            if(rows[0]){
                res.json(rows);
            }else{
                res.json({error:true
                        ,message: "error, verifique los datos de supervisor"})
            }
        }else{
            console.log(err)
        }
    });
});

//Obtener lista de productos
router.get("/app/obtenerProductos", (req, res)=>{

    const query = `
    select * from productos;
    `;

    mysqlConnection.query(query, (err, rows, fields)=>{
        if(!err){
            if(rows[0]){
                res.json(rows);
            }else{
                res.json({error:true
                        ,message: "sin datos"})
            }
        }else{
            console.log(err)
        }
    });
});

//Obtener lista de empleados operadores
router.get("/app/obtenerListaEmpleados", (req, res)=>{

    const query = `
    select idEmpleado, empleados.nombre as nombreEmpleado, estacion, tipo, estaciones.nombre as nombreEstacion, fases from empleados
    inner join estaciones on empleados.estacion = estaciones.idEstacion
    where tipo = 1;
    `;

    mysqlConnection.query(query, (err, rows, fields)=>{
        if(!err){
            if(rows[0]){
                res.json(rows);
            }else{
                res.json({error:true
                        ,message: "sin datos"})
            }
        }else{
            console.log(err)
        }
    });
});

//Obtener detalle actividades
router.get("/app/obtenerDetalleActividades", (req, res)=>{

    const query = `
    SELECT * FROM actividades 
    INNER JOIN ordenes_prod ON actividades.orden = ordenes_prod.idOrdenProd
    INNER JOIN tareas_estaciones ON actividades.tareas_estaciones = tareas_estaciones.idTarea
    INNER JOIN empleados ON actividades.empleado = empleados.idEmpleado;
    `;

    mysqlConnection.query(query, (err, rows, fields)=>{
        if(!err){
            if(rows[0]){
                res.json(rows);
            }else{
                res.json({error:true
                        ,message: "sin datos"})
            }
        }else{
            console.log(err)
        }
    });
});

//Obtener total minutos por empleado
router.get("/app/obtenerTotalMinutosEmpleado", (req, res)=>{

    var idEmpleado = req.query.idEmpleado;

    const query = `
    select minutos, tareas_estaciones.nombre, orden, orden_compra, estacion from actividades 
    INNER JOIN ordenes_prod ON actividades.orden = ordenes_prod.idOrdenProd
    INNER JOIN tareas_estaciones ON actividades.tareas_estaciones = tareas_estaciones.idTarea
    INNER JOIN empleados ON actividades.empleado = empleados.idEmpleado
    where empleado = ?;
    `;

    mysqlConnection.query(query,[idEmpleado], (err, rows, fields)=>{
        if(!err){
            if(rows[0]){
                var minutos = 0
                var ordenes = 0
                for(var i = 0;i<rows.length;i++){
                    minutos = minutos + rows[i].minutos
                    ordenes++
                }
                res.json({error:false
                            ,minutosTotales: minutos
                            ,ordenes:ordenes
                            ,rows});
            }else{
                res.json({error:true
                        ,message: "sin datos"})
            }
        }else{
            console.log(err)
        }
    });
});

//Obtener total minutos del turno del supervisor
router.get("/app/obtenerTotalMinutosSupervisor", (req, res)=>{

    var idSupervisor = req.query.idSupervisor;

    const query = `
    select * from actividades 
    INNER JOIN ordenes_prod ON actividades.orden = ordenes_prod.idOrdenProd
    INNER JOIN empleados ON actividades.empleado = empleados.idEmpleado
    where supervisor = ?;
    `;

    mysqlConnection.query(query,[idSupervisor], (err, rows, fields)=>{
        if(!err){
            if(rows[0]){
                var minutos = 0
                var ordenes = 0
                var totales_empleados = []
                for(var i = 0;i<rows.length;i++){
                    minutos = minutos + rows[i].minutos
                    ordenes++
                }
                res.json({error:false
                            ,minutosTotales: minutos
                            ,ordenes:ordenes
                            ,rows});
            }else{
                res.json({error:true
                        ,message: "sin datos"})
            }
        }else{
            console.log(err)
        }
    });
});



/*--------------------------------------------------POST METHODS for Android application ---------------------------------------------*/
//Crear nueva orden de compra
router.post("/app/nuevaOrdenProduccion", jsonParser, (req, res)=>{
    if(!req.body){
        res.sendStatus(403);
    }
    console.log(req.body);

    var {idProducto, cantProduct, idSupervisor} = req.body;

    const query = `
    insert into ordenes values(null, now(), null, 1,?, ?, ?);
    `;

    mysqlConnection.query(query, [idProducto, cantProduct, idSupervisor], (err, rows, field)=>{
        if(!err){    
            res.json({error:false
                ,message: "ok"});
        }else{
            res.json({error:true
                ,message: "error al crear la orden, revise los campos"});
                throw err;
        }
    });
});

router.post("/app/nuevaOrdenCompra", jsonParser, (req, res)=>{
    if(!req.body){
        res.sendStatus(403);
    }
    console.log(req.body);

    var {idProducto, idSupervisor, cantProduct} = req.body;

    const query = `
    insert into ordenes_compra values(null, ?, ?, ?, "EN PROCESO");
    `;

    mysqlConnection.query(query, [idProducto, idSupervisor, cantProduct], (err, rows, field)=>{
        if(!err){    
            res.json({error:false
                ,message: "ok"});
        }else{
            res.json({error:true
                ,message: "error al crear la orden, revise los campos"});
                throw err;
        }
    });
});

//Registrar actividades para las ordenes
router.post("/app/anadirActividades", jsonParser, (req, res)=>{
    if(!req.body){
        res.sendStatus(403);
    }
    console.log(req.body);

    var {idEmpleado, tareas_estaciones, minutos, orden} = req.body;

    const query = `
    insert into actividades values(?, ?, ?, ?);
    `;

    mysqlConnection.query(query, [idEmpleado, tareas_estaciones, minutos, orden], (err, rows, field)=>{
        if(!err){    
            res.json({error:false
                ,message: "ok"});
        }else{
            res.json({error:true
                ,message: "error al insertar un empleado, revise los campos"});
                throw err;
        }
    });
});

/*--------------------------------------------------PUT METHODS for Android application ---------------------------------------------*/

//Actualizar la etapa a una mayor
router.put("/app/actualizarEtapa", jsonParser, (req, res)=>{
    if(!req.body){
        res.sendStatus(403);
    }
    console.log(req.body);

    var {etapaNueva, idOrden} = req.body;

    const query = `
    UPDATE ordenes 
    SET 
    etapa_actual = ?
    WHERE
    idOrden = ?;
    `;

    mysqlConnection.query(query, [etapaNueva, idOrden], (err, rows, fields)=>{
        if(!err){    
            res.json({error:false
                ,message: "ok"});
        }else{
            res.json({error:true
                ,message: "error al actualizar la etapa"});
                throw err;
        }
    });
});

//Actualizar la orden a terminado agregando la horaSalida
router.put("/app/terminarOrden", jsonParser, (req, res)=>{
    if(!req.body){
        res.sendStatus(403);
    }
    console.log(req.body);

    var {idOrden} = req.body;

    const query = `
    UPDATE ordenes 
    SET 
    fechaHora_salida = now()
    WHERE
    idOrden = ?;
    `;

    mysqlConnection.query(query, [idOrden], (err, rows, fields)=>{
        if(!err){    
            res.json({error:false
                ,message: "ok"});
        }else{
            res.json({error:true
                ,message: "error al terminar"});
                throw err;
        }
    });
});

/*exports module =====>*/
module.exports = router;