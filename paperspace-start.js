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
            console.log(`\n=================\nStable Diffusion commands\n==================\n\nssh -L 127.0.0.1:7860:127.0.0.1:7860 paperspace@${machine.publicIpAddress}`);
            console.log(`cd stable-diffusion-webui && ./webui.sh --no-half\n`);
            console.log(`Then open http://localhost:7860 in your browser\n`);
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
            console.log(`Try again in 30 seconds.`);
            rl.close();
        });
    }
}

const selectMachine = () => paperspace.machines.list(function (err, res) {
    if (err) {
        return console.log(err.response.error)
        rl.close();
    }
    console.log(`\n***************\nMachines: ${res.length}\n***************`)
    res.map(m => console.log(`${m.id} - Status ${m.state} | "${m.name}" | GPU ${m.gpu} | CPUS ${m.cpus} | RAM ${Math.floor(Number(m.ram) / 1000000000)}GB`))
    console.log("***************\n")
    rl.question(`Enter Machine ID: `, (answer) => {
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
