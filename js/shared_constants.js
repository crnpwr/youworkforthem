// Conservation status
export const partyColours = [
    { id: "4", name: "Conservative", abbreviation: "Con",color: "#0063ba" },
    { id: "17", name: "Liberal Democrat", abbreviation: "LD",color: "#faa01a" },
    { id: "15", name: "Labour", abbreviation: "Lab",color: "#d50000" },
    { id: "30", name: "Sinn Féin", abbreviation: "SF",color: "#02665f" },
    { id: "22", name: "Plaid Cymru", abbreviation: "PC",color: "#348837" },
    { id: "7", name: "Democratic Unionist Party", abbreviation: "DUP",color: "#d46a4c" },
    { id: "44", name: "Green Party", abbreviation: "Green",color: "#78b82a" },
    { id: "29", name: "Scottish National Party", abbreviation: "SNP",color: "#fff685" },
    { id: "8", name: "Independent", abbreviation: "Ind",color: "#909090" },
    { id: "31", name: "Social Democratic & Labour Party", abbreviation: "SDLP",color: "#4ea268" },
    { id: "1036", name: "Reform UK", abbreviation: "RUK",color: "#12b6cf" },
    { id: "38", name: "Ulster Unionist Party", abbreviation: "UUP",color: "#a1cdf0" },
    { id: "47", name: "Speaker", abbreviation: "Spk",color: "#None" },
    { id: "158", name: "Traditional Unionist Voice", abbreviation: "TUV",color: "#0c3a6a" },
    { id: "1", name: "Alliance", abbreviation: "APNI",color: "#cdaf2d" }
  ];

export const expenseTypes = [
    { id: "accommodation", name: "Accommodation", value_field: "expenses_Accommodation", emoji: "🏠", header_text: "Accommodation expenses claimed by each MP since July 2024"},
    {id: "hospitality", name: "Hospitality & Gifts", value_field: "TotalHospitalityValue", emoji: "🥂", header_text: "Hospitality and gifts registered by each MP since July 2024"},
    { id: "total", name: "Total Expenses", value_field: "expenses_total", emoji: "🧾", header_text: "Total expense claims for each MP since July 2024"},
    { id: "earnings", name: "Earnings Outside Parliament", value_field: "TotalOutsideEarnings", emoji: "💼", header_text: "Earnings outside of Parliament for each MP since July 2024" },
    // More values are available here but commented out to de-clutter the UI
    //{ id: "office", name: "Office", value_field: "expenses_Office Costs", emoji: "🏢" },
    //{ id: "staff", name: "Staff", value_field: "expenses_Staffing", emoji: "👨‍💼" },
    //{ id: "misc", name: "Miscellaneous", value_field: "expenses_Miscellaneous", emoji: "🗂️" },
];

export const mpFilters = [
    { id: "landlords", name: "Landlords", field: "is_landlord", value: "True", emoji: "💰" },
    { id: "pip-cutters", name: "Voted to cut UC for people in poor health", field: "vote_2074_response_filter", value: "True", emoji: "🤒" },
    { id: "anti-renters", name: "Voted Against Renters Rights", field: "vote_1905_response_filter", value: "True", emoji: "🚫🏠"},
    { id: "anti-gas", name: "Voted Against Winter Fuel Allowance", field: "vote_1841_response_filter", value: "True", emoji: "❄️💸"},
    { id: "claims-utilities", name: "Claimed for their own utility bills", field: "claimed_for_utilities", value: "True", emoji: "🔥💸" },
];

export const MP_CIRCLE_RADIUS = 4;
export const MP_CIRCLE_RADIUS_SELECTED = 15;