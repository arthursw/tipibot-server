import fs from 'fs';
import { launchServer } from './server';

const settingsPath = 'settings.json';

fs.readFile(settingsPath, 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
        let settings = JSON.parse(data);
        let port = settings.websocketServerURL != null && settings.websocketServerURL.includes(':') ? settings.websocketServerURL.split(':')[1] : 6842;
        console.log('Starting websocket server on port ' + port);
        launchServer(port, settings);
}});
