
export async function resolve (specifier, context, defaultResolve) {
    const { url } = await defaultResolve(specifier, context);
    const format = url.endsWith('.geojson') ? 'json' : null;
    return { url, format };
}