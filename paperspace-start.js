const paperspace_node = require('paperspace-node');
const readline = require('readline');
const dotenv = require('dotenv');
dotenv.config();
const { exec } = require('child_process');

var paperspace = paperspace_node({
    apiKey: process.env.PAPERSPACE_API_KEY,
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function execWaitForOutput(command, execOptions = {}) {
    return new Promise((resolve, reject) => {
        const childProcess = exec(command, execOptions);

        // stream process output to console
        childProcess.stderr.on('data', data => console.error(data));
        childProcess.stdout.on('data', data => console.log(data));
        // handle exit
        childProcess.on('exit', () => resolve());
        childProcess.on('close', () => resolve());
        // handle errors
        childProcess.on('error', error => reject(error));
    })
}

const onMachineStart = async (machine) => {
    rl.question(`Do you want to start Auto-GPT? (y/n): `, (answer) => {
        if (answer === 'y') {
            console.log(`*****************\nRun these commands:\n\nssh -t paperspace@${machine.publicIpAddress} "cd Auto-GPT ; bash --login"\n./run.sh\n\n********************`)
            execWaitForOutput(`code --remote ssh-remote+paperspace@${machine.publicIpAddress} /home/paperspace/`)
        } else if (answer === 'n') {
            console.log(`Connect to Stable Diffusion with: ssh -L 127.0.0.1:3001:127.0.0.1:3001 paperspace@${machine.publicIpAddress}`);
            execWaitForOutput(`code --remote ssh-remote+paperspace@${machine.publicIpAddress} /home/paperspace/`)
        } else {
            console.log('Invalid input. Please enter "y" or "n".');
        }
        rl.close();
    });
}


const useMachine = (machine) => {
    if (machine.state === "ready") {
        rl.question(`Machine ${machine.id} is ready! Do you want to stop it? (y/n): `, (answer) => {
            if (answer === 'y') {
                console.log('Stopping machine...');
                paperspace.machines.stop({ machineId: machine.id },
                    function (err, res) {
                        if (err) {
                            console.log(err.response.error.text)
                        } else if (res) {
                            console.log('Machine stopped!');
                        }
                    }
                );
            } else if (answer === 'n') {
                return onMachineStart(machine)
            } else {
                console.log('Invalid input. Please enter "y" or "n".');
            }
            rl.close();
        });
    } else {
        console.log(`Machine ${machine.id} is not ready!`);
        paperspace.machines.start({ machineId: machine.id }, (err, machine) => {
            if (err) {
                console.log(err.response.error.text)
            }
            console.log(`Starting machine. Retry in 10 seconds.`);
            rl.close();
        });
    }
}

const selectMachine = () => paperspace.machines.list(function (err, res) {
    console.log(`***************\nMachines: ${res.length}\n***************`)
    console.log(res.map(m => `${m.id} "${m.name}"(${m.state}) ${m.gpu} GPU, ${m.cpus} CPUs, ${Math.floor(Number(m.ram) / 1000000000)} GB ram`))
    rl.question(`Which machine would you like to use ? Machine ID: `, (answer) => {
        machine = res.find(m => m.id === answer);
        if (machine) {
            return useMachine(machine)
        } else {
            console.log('Machine not found');
        }
        rl.close();
    });
});

selectMachine()