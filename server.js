const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000

app.use(express.json());

const readJsonFile = (callback) =>{
    fs.readFile('./Data/data.json','utf8',(err,data)=>{
        callback(JSON.parse(data));
    })
}
const writeJsonFile = (data,callback) =>{
    fs.writeFile('./Data/data.json',JSON.stringify(data,null,2),(err)=>{
        callback(err);
    })
}

app.get('/posts',(req,res)=>{
    readJsonFile((data)=>{
        res.status(200).send({data : data.posts});
    })
})
app.post('/posts',(req,res)=>{
    const dataFromBody = req.body;
    readJsonFile((data)=>{
        let dataStructure;
        
        if (Array.isArray(data)) {
            dataStructure = {
                lastId: data.length > 0 ? Math.max(...data.map(item => Number(item.id))) : 0,
                posts: data
            };
        } else if (!data || !data.posts) {
            dataStructure = {
                lastId: 0,
                posts: []
            };
        } else {
            dataStructure = data;
        }

        const newId = dataStructure.lastId + 1;
        const dataToSend = {
            id: newId,
            ...dataFromBody
        };

        dataStructure.lastId = newId;
        dataStructure.posts.push(dataToSend);

        writeJsonFile(dataStructure,(err)=>{
            if(err){
                res.status(500).send({message : 'Error in writing data to file'});
            }
            else{
                res.status(201).send({message : 'Data has been written to file'});
            }})
    })
})

app.put('/posts/:id',(req,res)=>{
    const id = req.params.id;
    readJsonFile((data)=>{
        const index = data.posts.findIndex((item)=> item.id === parseInt(id));
        if (index === -1) {
            return res.status(404).send({ 
                message: 'Post not found' 
            });
        }
        data.posts[index] = Object.assign({id : parseInt(id)},{...req.body});
        writeJsonFile(data,(err)=>{
            if(err){
                res.status(500).send({message : 'Error in writing data to file'});
            }else {
                res.status(200).send({message : 'Data has been updated in file'});
            }
        })
})})        

app.delete('/posts/:id',(req,res)=>{
    const id = req.params.id;
    readJsonFile((data)=>{
        const originalLength = data.posts.length;
        data.posts = data.posts.filter((item)=> item.id != id);
        if (originalLength === data.posts.length) {
            return res.status(404).send({ 
                message: 'Post not found' 
            });
        }
        writeJsonFile(data,(err)=>{
            if(err){
                res.status(500).send({message : 'Error in writing data to file'});
            }
            else{
                res.status(200).send({message : 'Data has been deleted from file'});
            }})
    })
})

app.listen(port , ()=>{
    console.log(`server is running on port ${port}`)
})