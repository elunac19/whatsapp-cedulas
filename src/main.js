const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const readline = require("readline");
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const { group } = require('console');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'localAuth'
    })
});

const country_code = "521";

const contactsPath = path.resolve(__dirname, 'contacts.json');
const contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf-8'));

client.initialize();

client.on('qr', (qr) => {
    qrcode.generate(qr, {small:true});
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('ready', () => {
    console.log('LOOGED IN')
    menuAction();
});

async function sendMyMessage(cont, chatId, textMessage, unidad) {
    //Iterator as parameter?
    //Append those that are missing, so they can be send later
    try {
        const sentMessage = await client.sendMessage(chatId, textMessage);
        console.log(`${cont} Mensaje enviado con éxito a ${unidad}`);
    } catch (error) {
        console.error(`${cont} Error al enviar mensaje a ${unidad} - ${error}`);
    }
}

async function sendMyFile(cont, chatId, folder, unidad) {
    //Iterator as parameter?
    //Append those that are missing, so they can be send later
    let file = MessageMedia.fromFilePath(`../docs/${folder}/${unidad}.pdf`);
    try {
        const sentMessage = await client.sendMessage(chatId, file);
        console.log(`${cont} ${folder} se envió con éxito a ${unidad}`);
    } catch (error) {
        console.error(`${cont} Error al enviar ${folder} a ${unidad}`);
    }
}

function inputText(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function messageAction(){
    console.log('[1] Mensaje Todas');
    console.log('[2] Mensaje Dirigido');
    console.log('[3] Mensaje Por Carpeta');
    console.log('[0] Atras'); 
    const option = await inputText("\n Elige una opción");

    switch (option) {
        case '1': {
            const message = await inputText("\n Escribe el mensaje que quieres enviar a [TODAS]: ");
            let cont = 0;
            for(group in contacts){
                cont += 1;
                const chatId = country_code + contacts[group].phone + "@c.us";
                await sendMyMessage(cont, chatId, message, group);
            }  
            break;
        }
        case '2': {
            const group = await inputText("\n Escribe la unidad destinataria: ");
            const message = await inputText(`\n Escribe el mensaje que quieres enviar a [${group}]: `);
            if(contacts[group]){
                const chatId = country_code + contacts[group].phone + "@c.us";
                await sendMyMessage(1, chatId, message, group);
            } 
            else {
                console.log(`La unidad [${group}] no existe`)
            }
            break;
        }
        case '3': {
            const folder = await inputText("\n Escribe la carpeta: ");
            const message = await inputText("\n Escribe el mensaje: ");
            if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
                const files = fs.readdirSync(folderPath);
                let cont = 0;
                for (const fileName of files) {
                    let contactName = fileName.replace('.pdf', '');
                    if (contacts[contactName]) {
                        cont += 1;
                        const contact = contacts[contactName];
                        const chatId = country_code + contact.phone + "@c.us";
                        await sendMyMessage(cont, chatId, message, contactName);
                    }
                };
            } 
            else {
                console.log(`La carpeta [${folderName}] no existe.`);
            }
            break;
        }
        case '0': {
            console.log('\n-------- ATRASS --------');
            break;
        }
        default: {
            console.log('\n------- INVALIDA -------');
            break;
        }
    }
    //call again menuAction, this is probably wrong approach
    menuAction();
}

async function menuAction() {
    console.log('\n------- MENU BOT -------');
    console.log('[1] Mandar Archivo');
    console.log('[2] Mandar Mensaje');
    console.log('[0] Salir');
    const option = await inputText("\n Elige una opción: ");

    switch (option) {
        case '1': {
            const folder = await inputText("\n Escribe la carpeta: ");
            const message = await inputText("\n Escribe el mensaje: ");
            const folderPath = path.resolve(__dirname, '../docs', folder);

            if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
                const files = fs.readdirSync(folderPath);
                let cont = 0;
                for (const fileName of files) {
                    let contactName = fileName.replace('.pdf', '');
                    if (contacts[contactName]) {
                        cont += 1;
                        const contact = contacts[contactName];
                        const chatId = country_code + contact.phone + "@c.us";
                        await sendMyMessage(cont, chatId, message, contactName);
                        await sendMyFile(cont, chatId, folder, contactName);
                    }
                };
                await sendMyMessage(cont, "5213314112084@c.us", `SE ENVIARION LAS ${folder }`, " ");
                await sendMyFile(cont, "5213314112084@c.us", folder, "GRATITUD");
            } 
            else {
                console.log(`La carpeta [${folder}] no existe.`);
            }
            break;
        }
        case '2': {
            console.log('\n------- MENSAJES -------');
            messageAction();
            break;
        }
        case '0': {
            console.log('\n------- SALIENDO -------');
            process.exit();
        }
        default: {
            console.log('\n------- INVALIDA -------');
            break;
        }
    }
    //call again menuAction, this is probably wrong approach
    menuAction();
}


