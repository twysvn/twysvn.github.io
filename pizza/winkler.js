// Updated Pizzas Data
var pizzas = {
    "Pizza Marinara": ["Tomatensauce", "Knoblauch", "Oregano"],
    "Pizza Margherita": ["Tomatensauce", "Mozzarella fior di latte", "Oregano"],
    "Pizza Pugliese": ["Tomatensauce", "Mozzarella fior di latte", "Zwiebel", "Parmesan", "Oregano"],
    "Pizza Würstel": ["Tomatensauce", "Mozzarella fior di latte", "Würstel", "Oregano"],
    "Pizza Schinken Pilze": ["Tomatensauce", "Mozzarella fior di latte", "Schinken", "Pilze", "Oregano"],
    "Pizza Capricciosa": ["Tomatensauce", "Mozzarella fior di latte", "Schinken", "Pilze", "Artischocken", "Oregano"],
    "Pizza Teufel": ["Tomatensauce", "Mozzarella fior di latte", "Salami", "Peperonata", "Oliven", "Oregano"],
    "Pizza Vier Jahreszeiten": ["Tomatensauce", "Mozzarella fior di latte", "Schinken", "Pilze", "Artischocken", "Oliven", "Oregano"],
    "Pizza Vier Käsesorten": ["Tomatensauce", "Mozzarella fior di latte", "Gorgonzola", "Brie", "Parmesan", "Oregano"],
    "Pizza Hawaii": ["Tomatensauce", "Mozzarella fior di latte", "Schinken", "Ananas", "Oregano"],
    "Pizza Tiroler": ["Tomatensauce", "Mozzarella fior di latte", "Speck", "Pilze", "Kaminwurze", "Zwiebel", "Oregano"],
    "Pizza Bauern": ["Tomatensauce", "Mozzarella fior di latte", "Speck", "Gekochtes Ei", "Pfifferlinge", "Oregano"],
    "Pizza Feuerwehr": ["Tomatensauce", "Mozzarella fior di latte", "Scharfe Salami", "Knoblauch", "Knoblauch", "Oregano"],
    "Pizza Vulkan": ["Tomatensauce", "Mozzarella fior di latte", "Scharfe Salami", "Lombardi", "Paprikapulver", "Oregano"],
    "Pizza Chef": ["Tomatensauce", "Mozzarella fior di latte", "Scharfe Salami", "Spiegelei", "Tonno", "Lombardi", "Oregano"],
    "Pizza Gustosa": ["Tomatensauce", "Mozzarella fior di latte", "Scharfe Salami", "Gorgonzola", "Pfifferlinge", "Oregano"],
    "Pizza Winkler": ["Tomatensauce", "Mozzarella fior di latte", "Spinat", "Steinpilze", "Speck", "Oregano"],
    "Pizza Mafiosa": ["Tomatensauce", "Mozzarella fior di latte", "Scharfe Salami", "Spiegelei", "Lombardi", "Oliven", "Oregano"],
    "Pizza Gorgonzola Spinat": ["Tomatensauce", "Mozzarella fior di latte", "Gorgonzola", "Spinat", "Oregano"],
    "Pizza Holzfäller": ["Tomatensauce", "Mozzarella fior di latte", "Speck", "Pfifferlinge", "Steinpilze", "Oregano"],
    "Pizza Gemüse": ["Tomatensauce", "Mozzarella fior di latte", "Vier Gemüse Sorten", "Oregano"],
    "Pizza Zigeuner": ["Tomatensauce", "Mozzarella fior di latte", "Champignon", "Lombardi", "Zwiebel", "Oliven", "Oregano"],
    "Pizza Sommer": ["Tomatensauce", "Mozzarella fior di latte", "Cocktail Tomaten", "Basilikum", "Knoblauch", "Parmesan", "Oregano"],
    "Pizza New": ["Tomatensauce", "Büffelmozzarella", "Rohschinken", "Oregano"],
    "Pizza Rohschinken Rucola": ["Tomatensauce", "Mozzarella fior di latte", "Rohschinken", "Rucola", "Oregano"],
    "Pizza Valtellina": ["Tomatensauce", "Mozzarella fior di latte", "Bresaola", "Rucola", "Parmesan", "Oregano"],
    "Pizza Griechische": ["Tomatensauce", "Mozzarella fior di latte", "Tomaten", "Oliven", "Feta", "Rucola", "Oregano"],
    "Pizza Philadelphia": ["Tomatensauce", "Mozzarella fior di latte", "Zucchini", "Philadelphia", "Rohschinken", "Oregano"],
    "Pizza Balsamica": ["Tomatensauce", "Mozzarella fior di latte", "Rohschinken", "Balsamico Glaze", "Parmesan", "Oregano"],
    "Pizza Feinschmecker": ["Tomatensauce", "Büffelmozzarella", "Cocktail Tomaten", "Pfifferlinge", "Parmesan", "Oregano"],
    "Pizza Mediterrane": ["Tomatensauce", "Büffelmozzarella", "Melanzane", "Basilikum", "Oregano"],
    "Pizza Tunfisch": ["Tomatensauce", "Mozzarella fior di latte", "Tonno", "Oregano"],
    "Pizza Meeresfrüchte": ["Tomatensauce", "Mozzarella fior di latte", "Meeresfrüchte", "Oregano"],
    "Pizza Romana": ["Tomatensauce", "Mozzarella fior di latte", "Sardellen", "Kapern", "Oregano"],
    "Pizza Napoli": ["Tomatensauce", "Mozzarella fior di latte", "Sardellen", "Oregano"],
    "Pizza Gamberetti": ["Tomatensauce", "Mozzarella fior di latte", "Shrimps", "Rucola", "Oregano"],
    "Calzone Schinken Pilze": ["Tomatensauce", "Mozzarella fior di latte", "Schinken", "Pilze", "Oregano"],
    "Calzone Spinat Gorgonzola": ["Tomatensauce", "Mozzarella fior di latte", "Spinat", "Gorgonzola", "Oregano"],
    "Filoncino Tonno": ["Tomatensauce", "Mozzarella fior di latte", "Tonno", "Brie", "Cocktail Soße"],
    "Filoncino Mexico": ["Tomatensauce", "Mozzarella fior di latte", "Lombardi", "Scharfe Salami", "Mais", "Zwiebel"],
    "Filoncino Vier Käse": ["Tomatensauce", "Mozzarella fior di latte", "Gorgonzola", "Brie", "Parmesan", "Rohschinken"],
    "Filoncino Bresaola": ["Tomatensauce", "Mozzarella fior di latte", "Tomaten", "Knoblauch", "Parmesan", "Rucola", "Bresaola"]
};

// Updated Ingredient Categories
var ingredientCategories = {
    "Choose Your Sauce": ["Tomatensauce"],
    "Choose Your Cheese": ["Mozzarella fior di latte", "Büffelmozzarella", "Gorgonzola", "Brie", "Feta", "Parmesan", "Philadelphia"],
    "Choose Your Proteins": ["Schinken", "Würstel", "Salami", "Scharfe Salami", "Speck", "Tonno", "Rohschinken", "Shrimps", "Bresaola"],
    "Choose Your Vegetables": ["Zwiebel", "Pilze", "Artischocken", "Peperonata", "Oliven", "Ananas", "Kaminwurze", "Pfifferlinge", "Lombardi", "Paprikapulver", "Spinat", "Steinpilze", "Vier Gemüse Sorten", "Champignon", "Cocktail Tomaten", "Rucola", "Zucchini", "Melanzane", "Tomaten", "Mais"],
    "Choose Your Other Toppings": ["Knoblauch", "Oregano", "Basilikum", "Spiegelei", "Gekochtes Ei", "Balsamico Glaze", "Kapern"]
};

// Updated generatePizzaName Function
function generatePizzaName(ingredients) {
    const baseNames = {
        "Tomatensauce": "Tomato Sauce",
        "Mozzarella fior di latte": "Mozzarella Fior di Latte",
        "Büffelmozzarella": "Buffalo Mozzarella",
        "Gorgonzola": "Gorgonzola",
        "Brie": "Brie",
        "Feta": "Feta",
        "Parmesan": "Parmesan",
        "Philadelphia": "Philadelphia",
        "Schinken": "Ham",
        "Würstel": "Sausage",
        "Salami": "Salami",
        "Scharfe Salami": "Spicy Salami",
        "Speck": "Bacon",
        "Tonno": "Tuna",
        "Rohschinken": "Prosciutto",
        "Shrimps": "Shrimps",
        "Bresaola": "Bresaola",
        "Zwiebel": "Onion",
        "Pilze": "Mushrooms",
        "Artischocken": "Artichokes",
        "Peperonata": "Peperonata",
        "Oliven": "Olives",
        "Ananas": "Pineapple",
        "Kaminwurze": "Smoked Sausage",
        "Pfifferlinge": "Chanterelles",
        "Lombardi": "Hot Peppers",
        "Paprikapulver": "Paprika",
        "Spinat": "Spinach",
        "Steinpilze": "Porcini Mushrooms",
        "Vier Gemüse Sorten": "Mixed Vegetables",
        "Champignon": "Champignon Mushrooms",
        "Cocktail Tomaten": "Cherry Tomatoes",
        "Rucola": "Arugula",
        "Zucchini": "Zucchini",
        "Melanzane": "Eggplant",
        "Tomaten": "Tomatoes",
        "Mais": "Corn",
        "Knoblauch": "Garlic",
        "Oregano": "Oregano",
        "Basilikum": "Basil",
        "Spiegelei": "Fried Egg",
        "Gekochtes Ei": "Boiled Egg",
        "Balsamico Glaze": "Balsamic Glaze",
        "Kapern": "Capers"
    };

    // Identify special pizza types
    if (
        ingredients.includes("Gorgonzola") &&
        ingredients.includes("Brie") &&
        ingredients.includes("Parmesan") &&
        ingredients.includes("Mozzarella fior di latte")
    ) {
        return "Four Cheese Pizza";
    }
    if (ingredients.includes("Schinken") && ingredients.includes("Ananas")) {
        return "Hawaiian Pizza";
    }
    if (ingredients.includes("Meeresfrüchte")) {
        return "Seafood Pizza";
    }
    if (
        ingredients.includes("Vier Gemüse Sorten") ||
        ingredients.every(ing => ingredientCategories["Choose Your Vegetables"].includes(ing))
    ) {
        return "Vegetable Pizza";
    }

    // Build the name based on predominant categories
    const categoryCounts = {
        "Choose Your Cheese": 0,
        "Choose Your Proteins": 0,
        "Choose Your Vegetables": 0,
        "Choose Your Other Toppings": 0
    };

    ingredients.forEach(ingredient => {
        for (const [category, items] of Object.entries(ingredientCategories)) {
            if (items.includes(ingredient)) {
                if (category !== "Choose Your Sauce") {
                    categoryCounts[category]++;
                }
                break;
            }
        }
    });

    let nameParts = [];

    if (categoryCounts["Choose Your Proteins"] > 2) {
        nameParts.push("Meat Lover's");
    } else if (categoryCounts["Choose Your Cheese"] > 2) {
        nameParts.push("Cheese Delight");
    } else if (categoryCounts["Choose Your Vegetables"] > 2) {
        nameParts.push("Veggie");
    }

    // Include main ingredients in the name
    const mainIngredients = ingredients
        .filter(
            ingredient =>
                ingredientCategories["Choose Your Proteins"].includes(ingredient) ||
                ingredientCategories["Choose Your Vegetables"].includes(ingredient)
        )
        .map(ingredient => baseNames[ingredient]);

    // Avoid duplicates and keep the name concise
    const uniqueMainIngredients = [...new Set(mainIngredients)].slice(0, 2);
    nameParts.push(...uniqueMainIngredients);

    // Finalize the pizza name
    const pizzaName = nameParts.join(" ") + " Pizza";

    return pizzaName.trim();
}
