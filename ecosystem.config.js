module.exports = {
    apps: [
        {
            name: 'padel',
            cwd: __dirname,
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3030',
            instances: 1, // bump to 'max' for cluster mode once you outgrow one core
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
            },
            max_memory_restart: '500M',
            out_file: '/var/log/padel/out.log',
            error_file: '/var/log/padel/error.log',
            time: true,
        },
    ],
}