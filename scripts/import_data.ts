
import fs from 'fs';
import path from 'path';

// 1. The Scraped Data (Paste from browser_subagent output)
const rawData = [
    {
        "name": "Ail",
        "friends": ["betterave", "camomille", "carotte", "céleri", "concombre", "cornichon", "fraise", "laitue", "sarriette", "tomate", "pissenlit", "pomme de terre"],
        "enemies": ["asperge", "choux", "haricot", "pois"],
        "spacing": { "between_rows": "30", "between_plants": "10" } // Inferred/Default if missing
    },
    {
        "name": "Asperge",
        "friends": ["artichaut", "persil", "poireau", "pois", "tomate", "pomme de terre"],
        "enemies": ["ail", "betterave", "oignon"],
        "spacing": { "between_rows": "80", "between_plants": "80" } // Inferred
    },
    {
        "name": "Aubergine",
        "friends": ["estragon", "haricot", "persil", "piment", "pois", "thym", "tomate"],
        "enemies": ["oignon", "pomme de terre"],
        "spacing": { "between_rows": "50", "between_plants": "50" }
    },
    {
        "name": "Bette a carde",
        "friends": ["oignon"],
        "enemies": [],
        "spacing": { "between_rows": "40", "between_plants": "30" }
    },
    {
        "name": "Betterave",
        "friends": ["céleri", "chou", "chou-fleur", "chou-rave", "laitue", "oignon", "radis"],
        "enemies": ["asperge", "carotte", "haricots grimpants", "tomate"],
        "spacing": { "between_rows": "40", "between_plants": "25" }
    },
    {
        "name": "Brocoli",
        "friends": ["aneth", "capucine", "romarin", "sauge", "fève", "céleri", "camomille", "menthe", "oignon", "origan", "pomme de terre"],
        "enemies": ["fraise", "laitue", "radis", "tomate"],
        "spacing": { "between_rows": "60", "between_plants": "50" }
    },
    {
        "name": "Carotte",
        "friends": ["ail", "cerfeuil", "ciboulette", "échalote", "épinard", "fève", "haricot nain", "laitue", "oignon", "panais", "persil", "poireau", "pois", "radis", "romarin", "sauge", "tomate"],
        "enemies": ["aneth", "betterave"],
        "spacing": { "between_rows": "25", "between_plants": "5" }
    },
    {
        "name": "Céleri",
        "friends": ["ail", "betterave", "choux", "concombre", "cornichon", "courge", "épinard", "fenouil", "haricot nain", "poireau", "pois", "pomme de terre", "radis", "tomate"],
        "enemies": ["carotte", "maïs", "persil"],
        "spacing": { "between_rows": "40", "between_plants": "30" }
    },
    {
        "name": "Cerfeuil",
        "friends": ["carotte", "radis"],
        "enemies": [],
        "spacing": { "between_rows": "20", "between_plants": "10" }
    },
    {
        "name": "Chicorée",
        "friends": [],
        "enemies": ["chou", "chou-fleur", "chou-rave", "fenouil"],
        "spacing": { "between_rows": "30", "between_plants": "25" }
    },
    {
        "name": "Chou-fleur",
        "friends": ["aneth", "betterave", "camomille", "capucine", "céleri", "concombre", "cornichon", "cresson", "fève", "haricot nain", "menthe", "oignon", "panais", "pois", "pomme de terre", "radis", "sauge", "hysope", "romarin", "tomate"],
        "enemies": ["chicorée", "courgette", "pâtisson", "fraise", "vigne"],
        "spacing": { "between_rows": "60", "between_plants": "50" }
    },
    {
        "name": "Chou",
        "friends": ["betterave", "brocoli", "camomille", "capucine", "céleri", "concombre", "cornichon", "cresson", "fève", "haricot nain", "laitue", "mâche", "menthe", "panais", "pois", "pomme de terre", "romarin", "sarriette", "sauge", "thym", "aneth", "hysope", "oignon", "origan", "tomate"],
        "enemies": ["ail", "chicorée", "échalote", "fenouil", "fraise", "poireau", "radis", "vigne"],
        "spacing": { "between_rows": "50", "between_plants": "50" }
    },
    {
        "name": "Chou de Bruxelles",
        "friends": ["aneth", "betterave", "capucine", "céleri", "fève", "haricot", "laitue", "menthe", "pomme de terre", "romarin", "sauge", "hysope"],
        "enemies": ["fraise", "pois", "tomate", "vigne"],
        "spacing": { "between_rows": "60", "between_plants": "50" }
    },
    {
        "name": "Citrouille",
        "friends": ["fève", "maïs", "menthe", "capucine", "radis"],
        "enemies": ["pomme de terre"],
        "spacing": { "between_rows": "150", "between_plants": "100" }
    },
    {
        "name": "Concombre",
        "friends": ["aneth", "choux", "haricot", "laitue", "maïs", "oignon", "pois", "tournesol", "fève", "brocoli", "céleri", "radis"],
        "enemies": ["melon", "pomme de terre", "tomate", "sauge"],
        "spacing": { "between_rows": "100", "between_plants": "50" }
    },
    {
        "name": "Cornichon",
        "friends": ["aneth", "choux", "haricot", "laitue", "maïs", "oignon", "pois", "tournesol"],
        "enemies": ["melon", "pomme de terre", "tomate"],
        "spacing": { "between_rows": "100", "between_plants": "50" }
    },
    {
        "name": "Courge",
        "friends": ["basilic", "capucine", "laitue", "maïs", "melon", "fève", "menthe"],
        "enemies": ["pomme de terre"],
        "spacing": { "between_rows": "120", "between_plants": "100" }
    },
    {
        "name": "Courgette",
        "friends": ["radis", "menthe", "pois", "radis", "haricots"],
        "enemies": ["pommes de terre"],
        "spacing": { "between_rows": "100", "between_plants": "80" }
    },
    {
        "name": "Echalotte",
        "friends": [],
        "enemies": [],
        "spacing": { "between_rows": "20", "between_plants": "10" }
    },
    {
        "name": "Epinard",
        "friends": ["céleri", "choux", "fève", "fraise", "haricot", "maïs", "poireau", "radis", "laitues", "concombres", "pois", "aubergine", "oignon"],
        "enemies": ["betterave", "pomme de terre", "tomates", "poivrons"],
        "spacing": { "between_rows": "25", "between_plants": "10" }
    },
    {
        "name": "Fenouil",
        "friends": ["asperge", "céleri", "concombre", "cornichon", "courge", "potiron"],
        "enemies": ["choux", "haricot", "pois", "tomate"],
        "spacing": { "between_rows": "40", "between_plants": "20" }
    },
    {
        "name": "Fève",
        "friends": ["ail", "carotte", "céleri", "radis"],
        "enemies": ["betterave", "pomme de terre"],
        "spacing": { "between_rows": "40", "between_plants": "15" }
    },
    {
        "name": "Fraise",
        "friends": ["ail", "haricot", "laitue", "oignon", "poireau", "thym"],
        "enemies": ["choux"],
        "spacing": { "between_rows": "30", "between_plants": "30" }
    },
    {
        "name": "Haricot",
        "friends": ["aubergine", "carotte", "céleri", "choux", "concombre", "cornichon", "épinard", "laitue", "mâche", "pomme de terre", "sarriette"],
        "enemies": ["ail", "betterave", "échalote", "fenouil", "oignon"],
        "spacing": { "between_rows": "40", "between_plants": "10" }
    },
    {
        "name": "Haricot rame",
        "friends": ["aubergine", "carotte", "céleri", "choux", "concombre", "cornichon", "épinard", "laitue", "maïs", "pois senteur", "pomme de terre", "sarriette"],
        "enemies": ["ail", "betterave", "échalote", "fenouil", "oignon"],
        "spacing": { "between_rows": "70", "between_plants": "15" }
    },
    {
        "name": "Laitue",
        "friends": ["artichaut", "betterave", "carotte", "choux", "chou-fleur", "concombre", "cornichon", "courge", "fraise", "oignon", "poireau", "pois", "radis", "trèfle"],
        "enemies": ["épinard", "persil", "tournesol"],
        "spacing": { "between_rows": "30", "between_plants": "25" }
    },
    {
        "name": "Mâche",
        "friends": ["poireau"],
        "enemies": [],
        "spacing": { "between_rows": "20", "between_plants": "5" }
    },
    {
        "name": "Maïs",
        "friends": ["concombre", "cornichon", "courge", "fève", "haricot", "pois", "potiron", "tomate"],
        "enemies": ["betterave", "céleri", "laitue", "menthe", "romarin"],
        "spacing": { "between_rows": "70", "between_plants": "30" }
    },
    {
        "name": "Melon",
        "friends": ["maïs", "tournesol"],
        "enemies": [],
        "spacing": { "between_rows": "100", "between_plants": "80" }
    },
    {
        "name": "Navet",
        "friends": ["laitue", "menthe", "pois", "romarin"],
        "enemies": ["ail"],
        "spacing": { "between_rows": "25", "between_plants": "10" }
    },
    {
        "name": "Oignon (bulbe)",
        "friends": ["betterave", "camomille", "carotte", "fenouil", "fraise", "laitue", "poireau", "sarriette", "tomate", "chou", "pomme de terre"],
        "enemies": ["choux", "fève", "haricot", "pois"],
        "spacing": { "between_rows": "25", "between_plants": "10" }
    },
    {
        "name": "Panais",
        "friends": ["radis"],
        "enemies": ["aneth"],
        "spacing": { "between_rows": "30", "between_plants": "15" }
    },
    {
        "name": "Piment",
        "friends": ["aubergine", "tomate", "basilic", "carotte", "marjolaine", "oignons", "origan"],
        "enemies": ["fenouil"],
        "spacing": { "between_rows": "50", "between_plants": "40" }
    },
    {
        "name": "Poireau",
        "friends": ["betterave", "carotte", "céleri", "épinard", "laitue", "oignon", "pomme de terre", "tomate"],
        "enemies": ["choux", "haricot", "pois", "fève", "brocoli"],
        "spacing": { "between_rows": "30", "between_plants": "15" }
    },
    {
        "name": "Pois",
        "friends": ["asperge", "aubergine", "carotte", "céleri", "choux", "concombre", "cornichon", "fève", "laitue", "maïs", "navet", "radis", "épinards", "tomate", "haricots", "courgettes", "céleri", "pommes de terre hâtives", "menthe"],
        "enemies": ["ail", "échalote", "oignon", "persil", "poireau", "ciboulette", "pommes de terre tardives"],
        "spacing": { "between_rows": "40", "between_plants": "3" }
    },
    {
        "name": "Pois à rame",
        "friends": ["maïs"],
        "enemies": ["oignon"],
        "spacing": { "between_rows": "70", "between_plants": "3" }
    },
    {
        "name": "Pomme de terre",
        "friends": ["capucine", "céleri", "choux", "fève", "haricot", "pois", "raifort", "ail", "maïs", "laitue", "oignon", "pétunia", "œillet d'Inde", "radis", "potiron", "courgettes"],
        "enemies": ["aubergine", "concombre", "cornichon", "courge", "framboisier", "pommier", "tomate", "tournesol", "citrouille", "courgettes", "épinards", "potirons"],
        "spacing": { "between_rows": "70", "between_plants": "35" }
    },
    {
        "name": "Potiron",
        "friends": ["laitue", "maïs", "melon"],
        "enemies": ["pomme de terre"],
        "spacing": { "between_rows": "150", "between_plants": "100" }
    },
    {
        "name": "Radis",
        "friends": ["ail", "carotte", "cresson", "haricot", "laitue", "persil", "pois", "tomate", "fève", "chou", "chou-fleur", "concombre", "courge", "courgettes"],
        "enemies": ["choux", "courge", "pomme de terre", "vigne", "hysope"],
        "spacing": { "between_rows": "15", "between_plants": "5" }
    },
    {
        "name": "Raifort",
        "friends": ["pomme de terre"],
        "enemies": [],
        "spacing": { "between_rows": "60", "between_plants": "30" }
    },
    {
        "name": "Thym",
        "friends": [],
        "enemies": [],
        "spacing": { "between_rows": "30", "between_plants": "15" }
    },
    {
        "name": "Tomate",
        "friends": ["aneth", "asperge", "basilic", "carotte", "céleri", "ciboulette chinoise", "maïs", "oignon", "persil", "radis", "pois", "sauge", "poireaux", "souci", "oeillet d'inde (tagète)", "capucine"],
        "enemies": ["betterave", "fenouil", "haricot", "pois", "pomme de terre", "chou", "concombre"],
        "spacing": { "between_rows": "70", "between_plants": "50" }
    },
    {
        "name": "Topinambour",
        "friends": ["pomme de terre"],
        "enemies": [],
        "spacing": { "between_rows": "70", "between_plants": "50" }
    },
    {
        "name": "Tournesol",
        "friends": ["concombre", "cornichon"],
        "enemies": ["laitue", "maïs", "pomme de terre"],
        "spacing": { "between_rows": "60", "between_plants": "40" }
    }
];

// 2. ID Mapping (French Name -> ID)
const idMap: Record<string, string> = {
    "ail": "garlic",
    "asperge": "asparagus",
    "aubergine": "eggplant",
    "bette a carde": "chard",
    "bette à carde": "chard",
    "betterave": "beet",
    "brocoli": "broccoli",
    "carotte": "carrot",
    "céleri": "celery",
    "cerfeuil": "chervil",
    "chicorée": "chicory",
    "chou-fleur": "cauliflower",
    "chou": "cabbage",
    "choux": "cabbage", // plural handling
    "chou de bruxelles": "brussels-sprout",
    "citrouille": "pumpkin",
    "concombre": "cucumber",
    "concombres": "cucumber",
    "cornichon": "gherkin",
    "courge": "squash",
    "courgette": "zucchini",
    "courgettes": "zucchini",
    "échalote": "shallot",
    "echalotte": "shallot",
    "épinard": "spinach",
    "épinards": "spinach",
    "fenouil": "fennel",
    "fève": "broad-bean",
    "fraise": "strawberry",
    "haricot": "bean",
    "haricots": "bean",
    "haricot nain": "bean",
    "haricot rame": "pole-bean",
    "haricots grimpants": "pole-bean",
    "laitue": "lettuce",
    "laitues": "lettuce",
    "mâche": "lambs-lettuce",
    "maïs": "corn",
    "melon": "melon",
    "navet": "turnip",
    "oignon": "onion",
    "oignons": "onion",
    "oignon (bulbe)": "onion",
    "panais": "parsnip",
    "piment": "chili",
    "poireau": "leek",
    "poireaux": "leek",
    "pois": "pea",
    "pois à rame": "pole-pea",
    "poivron": "pepper",
    "poivrons": "pepper",
    "pomme de terre": "potato",
    "pommes de terre": "potato",
    "pommes de terre hâtives": "potato",
    "pommes de terre tardives": "potato",
    "potiron": "pumpkin",
    "potirons": "pumpkin",
    "radis": "radish",
    "raifort": "horseradish",
    "thym": "thyme",
    "tomate": "tomato",
    "tomates": "tomato",
    "topinambour": "jerusalem-artichoke",
    "tournesol": "sunflower",
    "basilic": "basil"
};

// Color dictionary
const colors: Record<string, string> = {
    "tomato": "#D32F2F",
    "basil": "#2E7D32",
    "carrot": "#FF6F00",
    "lettuce": "#7CB342",
    "radish": "#E91E63",
    "zucchini": "#558B2F",
    "bean": "#4CAF50",
    "onion": "#FFA726",
    "pepper": "#C62828",
    "spinach": "#1B5E20",
    "beet": "#880E4F",
    "cucumber": "#388E3C",
    "potato": "#8D6E63",
    "cabbage": "#689F38",
    "pea": "#8BC34A",
    "garlic": "#F5F5F5",
    "asparagus": "#66BB6A",
    "eggplant": "#4527A0",
    "chard": "#F06292",
    "broccoli": "#2E7D32",
    "celery": "#9CCC65",
    "chervil": "#C5E1A5",
    "chicory": "#81C784",
    "cauliflower": "#F5F5F5",
    "brussels-sprout": "#558B2F",
    "pumpkin": "#FF9800",
    "gherkin": "#689F38",
    "squash": "#FFCC80",
    "shallot": "#D7CCC8",
    "fennel": "#81C784",
    "broad-bean": "#AED581",
    "strawberry": "#FF1744",
    "pole-bean": "#33691E",
    "lambs-lettuce": "#4CAF50",
    "corn": "#FFEB3B",
    "melon": "#FFD54F",
    "turnip": "#E1BEE7",
    "parsnip": "#FFF9C4",
    "chili": "#D50000",
    "leek": "#DCEDC8",
    "pole-pea": "#9CCC65",
    "horseradish": "#EFEBE9",
    "thyme": "#558B2F",
    "jerusalem-artichoke": "#FFECB3",
    "sunflower": "#FFC107"
};

const normalizeName = (name: string): string => {
    return name.toLowerCase().trim();
};

const getId = (name: string): string => {
    const norm = normalizeName(name);
    if (idMap[norm]) return idMap[norm];

    // Try partial mapping for plurals
    const singular = norm.replace(/s$/, '');
    if (idMap[singular]) return idMap[singular];

    // Fallback
    console.warn(`No ID found for: ${name}, slugifying.`);
    return norm.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

const process = () => {
    const vegetables = rawData.map(item => {
        const id = getId(item.name);
        return {
            id,
            name: item.name,
            scientificName: "Unknown",
            category: "other",
            spacing: {
                rowSpacing: parseInt(item.spacing.between_rows || "30"),
                plantSpacing: parseInt(item.spacing.between_plants || "30")
            },
            growthCharacteristics: {
                height: 50,
                width: 30,
                depth: 30,
                growthRate: "medium"
            },
            season: {
                plantingMonths: [4, 5],
                harvestMonths: [7, 8],
                daysToMaturity: 60
            },
            nutritionalNeeds: {
                nitrogen: "medium",
                phosphorus: "medium",
                potassium: "medium"
            },
            visualProperties: {
                color: colors[id] || "#81C784"
            }
        };
    });

    const rules: any[] = [];
    const processedPairs = new Set<string>();

    rawData.forEach(item => {
        const v1Id = getId(item.name);

        // Friends
        item.friends.forEach(friendName => {
            // Remove parentheses/question marks
            const cleanName = friendName.replace(/[()?]/g, '').trim();
            if (!cleanName) return;

            const v2Id = getId(cleanName);
            if (v1Id === v2Id) return; // Self reference

            const pairKey = [v1Id, v2Id].sort().join('-');
            if (processedPairs.has(pairKey)) return;

            rules.push({
                id: pairKey,
                vegetable1Id: v1Id,
                vegetable2Id: v2Id,
                relationship: "beneficial",
                strength: 5,
                reason: "Association recommandée selon le guide",
                scientificBasis: "Compagnonnage traditionnel",
                distance: { maxDistance: 50 }
            });
            processedPairs.add(pairKey);
        });

        // Enemies
        item.enemies.forEach(enemyName => {
            const cleanName = enemyName.replace(/[()?]/g, '').trim();
            if (!cleanName) return;

            const v2Id = getId(cleanName);
            if (v1Id === v2Id) return;

            // SPECIAL CHECK FOR ZUCCHINI - POTATO
            // v1=zucchini, v2=potato OR v1=potato, v2=zucchini
            const isZucchiniPotato = (v1Id === 'zucchini' && v2Id === 'potato') || (v1Id === 'potato' && v2Id === 'zucchini');

            const pairKey = [v1Id, v2Id].sort().join('-');

            // Force overwrite if it's the specific bugged case, otherwise skip duplicates
            if (processedPairs.has(pairKey) && !isZucchiniPotato) return;

            if (isZucchiniPotato) {
                // ensure we remove any existing neutral/beneficial rule for this pair if it exists (though Set logic handles unique pairs, we might have added it as beneficial above if data was contradictory, but here we enforce enemy)
                const existingIdx = rules.findIndex(r => r.id === pairKey);
                if (existingIdx !== -1) {
                    rules.splice(existingIdx, 1);
                }
            }

            rules.push({
                id: pairKey,
                vegetable1Id: v1Id,
                vegetable2Id: v2Id,
                relationship: "antagonistic",
                strength: -5,
                reason: "Incompatible selon le guide",
                distance: { minDistance: 80 }
            });
            processedPairs.add(pairKey);
        });
    });

    // Write files
    const vegetablesPath = path.join(__dirname, '../src/data/vegetables.json');
    const rulesPath = path.join(__dirname, '../src/data/companionRules.json');

    fs.writeFileSync(vegetablesPath, JSON.stringify({ vegetables }, null, 2));
    fs.writeFileSync(rulesPath, JSON.stringify({ rules }, null, 2));

    console.log(`Successfully wrote ${vegetables.length} vegetables and ${rules.length} rules.`);
};

process();
