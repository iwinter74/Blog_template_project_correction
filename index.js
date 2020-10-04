const express = require("express")
const app = express()
const data = require("./data.json")
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 5050;
const fs = require('fs')
const formidable = require("formidable")
const path = require("path");


const newArr = []
while (newArr.length < 6) {
    let num = Math.floor(Math.random() * data.length)
    if (!newArr.includes(num) && num != 0) {
        newArr.push(num)
    }
}

app.set("view engine", "ejs")
app.use(express.static("uploads"));
app.use(express.static("public"))
// var jsonParser = bodyParser.json()
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.listen(PORT, () => {
    console.log("server at http://localhost:5050")
})

app.get("/", (req, res) => {
    res.status(200.).render("index", { data: data })
})

app.get("/newArticle", (req, res) => {
    res.render("newArticle", { newArr: newArr, data: data })
})
app.get("/uploadFile", (req, res) => {
    res.render("uploadFile", { newArr: newArr, data: data })
})

app.get("/blog/:id", (req, res) => {
    console.log(req.params.id)
    const blogItem = data.find(element => element.id = req.params.id);
    res.render("blogItem", { blogItem, data: data, newArr: newArr })
})

app.post('/newData', (req, res) => {
    let monthsArr = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let today = new Date();
    let month = monthsArr[today.getMonth()];
    let day = today.getDate();
    let year = today.getFullYear();
    console.log(req.body.title)
    let newData = {
        id: data.length,
        url: req.body.url,
        title: req.body.title,
        body: req.body.body,
        published_at: `${month} ${day}, ${year}`,
        duration: (req.body.body.length / 400).toFixed(),
        author: req.body.author,
        author_bild: req.body.authorPicture
    }
    console.log(newData)
    data.push(newData)

    let newJsonData = JSON.stringify(data)
    fs.writeFile("data.json", newJsonData, (err) => {
        if (err) throw err
        console.log("Written")
    })

    res.status(201).redirect('/')
})

app.post("/blogs/upload", (req, res, next) => {
    const form = formidable({ multiples: true, uploadDir: "./uploads", keepExtensions: true });

    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }

        console.log(path.basename(files.authorPicture.path))
        console.log(path.basename(files.url.path))
        console.log(fields)
        let monthsArr = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let today = new Date();
        let month = monthsArr[today.getMonth()];
        let day = today.getDate();
        let year = today.getFullYear();
        console.log(req.body.title)

        let newBlog = {
            id: Date.now(),
            url: '/' + path.basename(files.url.path),
            title: fields.title,
            body: fields.body,
            published_at: `${month} ${day}, ${year}`,
            duration: (fields.body.length / 400).toFixed(),
            author: fields.author,
            authorPicture: '/' + path.basename(files.authorPicture.path)
        }
        data.unshift(newBlog)

        let newJsonData = JSON.stringify(data)
        fs.writeFile("data.json", newJsonData, (err) => {
            if (err) throw err
            console.log("Written")
        })

        res.status(201).redirect('/')

        //res.json({ fields, files });
    });
    // res.status(201).redirect('/')
})

app.use((req, res) => {
    res.render("404")
})