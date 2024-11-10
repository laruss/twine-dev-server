export async function runCompile() {
    const proc = Bun.spawn(['npm', 'run', 'compile']);
    const text = await new Response(proc.stdout).text();
    await proc.exited;
    console.log(text);
}
