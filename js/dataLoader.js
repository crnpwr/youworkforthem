let dataRefCache = null;

export async function loadDataRef() {
    if (dataRefCache) return dataRefCache;
    const response = await fetch('data/data_ref.json');
    dataRefCache = await response.json();
    return dataRefCache;
}