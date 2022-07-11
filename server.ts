import { copyObjectProperties, Settings } from "./tipibot-controller-gui/ts/Settings";
import { CommeUnDesseinServer } from "./CommeUnDesseinServer";
import { CommunicationServer } from "./CommunicationServer";
import { Calibration } from "./tipibot-controller-gui/ts/CalibrationStatic";
import { Tipibot } from "./tipibot-controller-gui/ts/TipibotStatic";
import { Renderer } from "./tipibot-controller-gui/ts/Renderer";
import { WebSocket } from 'ws';
import SerialPort from 'serialport';
import fs from 'fs';

let wssController = null;

let wsController = null;

var serialPort = null;
var serialPorts = [];
const settingsPath = 'settings.json';
let commeUnDessein:CommeUnDesseinServer = null

let send = (ws, type, data=null)=> {
    let messageObject = {type: type, data: data, time: Date.now()}
    if(ws != null) {
        ws.send( JSON.stringify(messageObject) );
    }
    CommunicationServer.emitter.emit('message', messageObject)
}

let createSerialPort = (data)=> {
    
    console.log('Opening serial port ' + data.name + ', at ' + data.baudRate)
    if(serialPorts instanceof Array && !serialPorts.includes(data.name)) {
        console.error('trying to connect to an unexisting serial port: ', data.name)
    }
    
    serialPort = new SerialPort(data.name, { baudRate: data.baudRate, lock:false }, serialPortCreationCallback)

    serialPort.on('data', onSerialPortData)

    serialPort.on('error', onSerialPortError)
}

let serialPortCreationCallback = (err)=> {
    if (err) {
        console.log('Error: ', err.message);
        wsController.send({type: 'error', data: err.message});
        return;
    }
    console.log('Connection established.');
    send(wsController, 'opened');
}

let onSerialPortData = (data)=> {
    console.log('got serial port data', data)
    let message = data.toString('utf8')
    send(wsController, 'data', message)
}

let onSerialPortError = (err)=> {
    console.error(err.message)
    send(wsController, 'error', err.message)
}

let serialPortWriteCallback = (err)=> {
    if (err) {
        console.log('Error on write: ', err.message);
        send(wsController, 'error', err.message);
        return;
    }
}

let listSerialPorts = ()=> {
    console.log('List serial ports...');
    SerialPort.list().then(listSerialPortsCallback)
};

let listSerialPortsCallback = (data)=> {
    console.log(data);
    if(data != null) {
        if(data instanceof Array) {
            serialPorts = data
        }
        send(wsController, 'list', data)
    }
}

let closeSerialPort = ()=> {
    if(serialPort != null) {
        console.log('Closing serial port...')
        serialPort.close(closeSerialPortCallback)
    } else {
        console.log('Could not close: no opened serial port.')
    }
}

let closeSerialPortCallback = (result)=> {
    console.log('Port closed: ', result)
    send(wsController, 'closed')
    serialPort = null
}

let onControllerConnection = (ws)=> {
    wsController = ws
    ws.on('message', onControllerJSONMessage)
    // ws.on('open', onControllerOpen)
    ws.on('close', onControllerClose)
    listSerialPorts()
    send(wsController, 'load-settings', Settings)
    commeUnDessein.sendState()
}

let getSerialPortInfo = ()=> {
    console.log('Serial port info', serialPort)
    return serialPort != null ? {baudRate: serialPort.baudRate, isOpen: serialPort.isOpen, path: serialPort.path} : {}
}

let onControllerMessage = (type, data)=> {
    console.log('onControllerMessage', type, data)
    if(type == 'data') {

        if(serialPort == null) {
            send(wsController, 'error', 'Could not write data: no opened serial port.');
            return;
        }

        send(wsController, 'sent', data);
        console.log('send serial port data:', data)
        serialPort.write(data, serialPortWriteCallback);
    
    } else if(type == 'comme-un-dessein-start') {
        commeUnDessein.start()
    } else if(type == 'comme-un-dessein-stop') {
        commeUnDessein.stopAndClear()
    } else if(type == 'comme-un-dessein-changed') {
        commeUnDessein.saveSettings(data.key, data.value)
    } else if(type == 'list') {
        listSerialPorts();
    } else if(type == 'is-connected') {
        send(wsController, serialPort != null ? 'connected' : 'not-connected', getSerialPortInfo());
    } else if(type == 'save-settings') {
        copyObjectProperties(Settings, data)
        fs.writeFile(settingsPath, JSON.stringify(data), 'utf8', ()=> console.log('Settings saved.', data));
    } else if(type == 'open') {
        
        if(serialPort != null) {
            send(wsController, 'already-opened', getSerialPortInfo());
            return
        }

        createSerialPort(data)

    } else if(type == 'close') {
        closeSerialPort();
    }
}

let onControllerJSONMessage = (messageObject: any)=> {
    let type = null;
    let data = null;
    try {
        let json = JSON.parse(messageObject);
        type = json.type;
        data = json.data;
        onControllerMessage(type, data)
    } catch (e) {
        console.log(e);
    }
}

// let onControllerOpen = (data)=> {
//     console.log('WebSocket opened');
//     send(wsController, 'load-settings', Settings);
//     commeUnDessein.sendState()
// }

let onControllerClose = (data)=> {
    wsController = null;
}

let initializeTipibot = ()=> {

    let renderer = new Renderer()

    let communication = new CommunicationServer(onControllerMessage, (type:string, data:any)=> send(wsController, type, data))

    Calibration.initialize()
    

    communication.setTipibot(Tipibot.tipibot)
    Tipibot.tipibot.initialize()

    renderer.centerOnTipibot(Settings.tipibot)

    commeUnDessein = new CommeUnDesseinServer()
}

export let launchServer = (port: number=6842, newSettings: object)=> {
    copyObjectProperties(Settings, newSettings)
    wssController = new WebSocket.Server({ port: port })
    wssController.on('connection', onControllerConnection)
    initializeTipibot()
}
