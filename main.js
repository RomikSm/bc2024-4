const {program} = require('commander');
const path = require('path');
const http = require('http')
const fs = require('fs').promises;

program
  .requiredOption('-h, --host <address>', 'адреса сервера') 
  .requiredOption('-p, --port <number>', 'порт сервера') 
  .requiredOption('-c, --cache <path>', 'шлях до директорії, яка міститиме закешовані файли'); 

program.parse();

const options = program.opts();

const requestListener = async function (req, res) {
    const fileName = req.url.slice(1);
    const filePath = path.join(options.cache, `${fileName}.jpg`);

    const setImageHeaders = () => {
        res.setHeader('Content-Type', 'image/jpeg');
    };

    switch (req.method) {
        case 'GET':
            try {
                const data = await fs.readFile(filePath);
                setImageHeaders();
                res.statusCode = 200;
                res.end(data);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    res.statusCode = 404;
                    res.end('Not Found');
                } else {
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            }
            break;
        case 'PUT':
            const chunks = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', async () => {
                try {
                    const imageData = Buffer.concat(chunks);
                    await fs.writeFile(filePath, imageData);
                    res.statusCode = 201;
                    res.end('Created');
                } catch (error) {
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            });
            break;

        case 'DELETE':
            try {
                await fs.unlink(filePath);
                res.statusCode = 200;
                res.end('OK');
            } catch (error) {
                if (error.code === 'ENOENT') {
                    res.statusCode = 404;
                    res.end('Not Found');
                } else {
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            }
            break;
        default:
            res.statusCode = 405;
            res.end('Method Not Allowed')
    }
};

const server = http.createServer(requestListener);

server.listen(options.port, options.host, () => {
  console.log(`Server is running on http://${options.host}:${options.port}`);
});
