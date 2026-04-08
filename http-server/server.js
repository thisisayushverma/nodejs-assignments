// start creating server here
import { error } from "console";
import http from "http";

const todo = [];
let currentInd = 0;

const resolveBody = (req)=>{
    return new Promise((res,rej)=>{
        let body = "";
        req.on('data', chunk => body+=chunk);
        req.on('end',()=>  res(JSON.parse(body)));
        req.on('error',rej)
    })
}

const server = http.createServer(async(req,res)=>{
    // res.end(`Hellow works - ${req.headers}`);
    const url = req.url;
    const method = req.method;
    
    const hostName = req.headers.host;
    const parsedUrl = new URL(url,`http://${hostName}`);
    console.log("hellow",req.url,method);
    // console.log("parsedUrl -",parsedUrl);
    if(parsedUrl.pathname ==='/' && method==="GET"){
        res.statusCode = 200;
        // res.setHeader( 'Content-Type', 'application/json' );
        res.end("Hello World");
        return;
    }
    // create todo
    if(parsedUrl.pathname === '/create/todo' && method === "POST" ){
        // console.log("hello world");
        // const {title, description} = req.
        // let body = "";
        // req.on('data',(chunk)=>{
        //     console.log("chunk - ",chunk);
        //     body += chunk;
        // })

        // req.on('end',()=>{
        //     console.log("body - ", body);
        //     body = JSON.parse(body);
        // })

        try {
            const finalBody = await resolveBody(req);
            // console.log("final body - ",finalBody);
            const {title,description} = finalBody;

            if(!title || !description){
                res.statusCode = 400;
                res.setHeader( 'Content-Type', 'application/json' );
                res.end(JSON.stringify({status:400,data:null,error:"Invalid request"}));
                return;
            }

            todo.push({
                id : ++currentInd,
                title,
                description
            })

            res.statusCode = 200;
            res.setHeader( 'Content-Type', 'application/json' );
            res.end(JSON.stringify(todo))
            
        } catch (error) {
            console.log("error - " , error);
            res.statusCode = 400;
            res.setHeader( 'Content-Type', 'application/json' );
            res.end(JSON.stringify({error:"Todo not found"}));

        }
        return;
    } 

    // get all todo
    if(parsedUrl.pathname === '/todos' && method ==="GET"){

        const {id} = Object.fromEntries(parsedUrl.searchParams)
        // console.log("id - ",id);
        
        if(id){
            const getTodo = todo.filter((item) => item.id === Number(id));
            console.log("getTodo",getTodo);
            if(!getTodo.length){
                res.statusCode = 404;
                res.setHeader( 'Content-Type', 'application/json' );
                res.end(JSON.stringify({error:"Todo not found"}));
                return;
            }
            res.statusCode = 200;
            res.setHeader( 'Content-Type', 'application/json' );
            res.end(JSON.stringify(getTodo));
            return;
        }


        res.statusCode = 200;
        res.setHeader( 'Content-Type', 'application/json' );
        res.end(JSON.stringify(todo));
        return;
    }

    if(parsedUrl.pathname === '/todos' && method ==="DELETE"){
        const {id} = Object.fromEntries(parsedUrl.searchParams);
        if(!id){
            res.statusCode = 400;
            res.setHeader( 'Content-Type', 'application/json' );
            res.end(JSON.stringify({status:400,data:todo,error:null}));
            return;
        }

        // const prevlength = todo.length;
        // todo = todo.filter((item) => item.id !== Number(id));

        const findIndex = todo.findIndex(item => item.id === Number(id));
        if(findIndex !== -1){

            todo.splice(findIndex,1);
            res.statusCode = 200;
            res.setHeader( 'Content-Type', 'application/json' );
            res.end(JSON.stringify({status:200,data:"todo delete successfully",error:null}));
            return;
        }

        res.statusCode = 404;
        res.setHeader( 'Content-Type', 'application/json' );
        res.end(JSON.stringify({status:404,data:null,error:"Todo not found"}));
        return;
    }

    res.statusCode = 404;
    res.setHeader( 'Content-Type', 'application/json' );
    res.end(JSON.stringify({status:404,data:null,error:"Invalid Request"}));
    return;

})



server.listen(3000,'localhost',()=>{
    console.log("server is runnning on port 3000");
})