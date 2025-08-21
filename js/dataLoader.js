let dataRefCache = null;
let mpDataPromise = null;

export async function loadDataRef() {
    if (dataRefCache) return dataRefCache;
    const response = await fetch('data/data_ref.json');
    dataRefCache = await response.json();
    return dataRefCache;
}

export function loadMpData() {
    if (!mpDataPromise) {
        mpDataPromise = d3.csv("data/mp_data_summary.csv", d3.autoType);
    }
    return mpDataPromise;
}

export function loadMpDataLandlordStatic() {
    if (!mpDataPromise) {
        mpDataPromise = d3.csv("data/mp_data_summary_static_landlords.csv", d3.autoType);
    }
    return mpDataPromise;
}