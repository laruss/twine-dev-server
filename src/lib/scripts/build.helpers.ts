export async function runCompile(isBuild: boolean = false) {
    const proc = Bun.spawn([
        'npm',
        'run',
        'compile',
        ...(isBuild ? ['--', '--build'] : []),
    ]);
    const text = await new Response(proc.stdout).text();
    await proc.exited;
    console.log(text);
}
