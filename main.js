const {program} = require('commander');
const http = require('http')

program
  .requiredOption('-h, --host <address>', 'адреса сервера') 
  .requiredOption('-p, --port <number>', 'порт сервера') 
  .requiredOption('-c, --cache <path>', 'шлях до директорії, яка міститиме закешовані файли'); 

program.parse();

const options = program.opts();

const server = http.createServer();

server.listen(options.port, options.host, () => {
  console.log(`Server is running on http://${options.host}:${options.port}`);
});
