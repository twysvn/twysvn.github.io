var pizzas = {
    "Gemüse": ["Mozzarella", "Tomatensauce", "Spinach", "Zucchini", "Mais", "Tomaten", "Origano"],
    "Stoaner Mandel": ["Mozzarella", "Tomatensauce", "Steinpilze", "Kaminwurz", "Origano"],
    "Jochtal": ["Mozzarella", "Tomatensauce", "Ei", "Speck", "Zwiebel", "Schafskäse", "Origano"],
    "Almwiesen": ["Mozzarella", "Tomatensauce", "Spinach", "Kräutertopfen", "Origano"],
    "Plattspitz": ["Mozzarella", "Tomatensauce", "Scharfe Salami", "Spinat", "Gorgonzola", "Origano"],
    "Jägerpizza": ["Mozzarella", "Tomatensauce", "Steinpilze", "Pfifferlinge", "Speck", "Origano"],
    "Skitour": ["Mozzarella", "Tomatensauce", "Rohschinken", "Origano"],
    "Bergrestaurant": ["Mozzarella", "Tomatensauce", "Rucola", "Marinierte Tomaten", "Origano"],
    "Deliziosa": ["Mozzarella", "Tomatensauce", "Thunfisch", "Spinach", "Kräuterkäse", "Cocktailsauce", "Origano"],
    "Chef": ["Mozzarella", "Tomatensauce", "Bresaola", "Rucola", "Basilikum", "Parmesansplitter", "Origano"],
    "Margherita": ["Mozzarella", "Tomatensauce", "Origano"],
    "Marinara": ["Tomatensauce", "Knoblauch", "Origano"],
    "Capricciosa": ["Mozzarella", "Tomatensauce", "Schinken", "Pilze", "Artischocken", "Origano"],
    "Diavola": ["Mozzarella", "Tomatensauce", "Scharfe Salami", "Peperonata", "Oliven", "Origano"],
    "Schinken-Pilze": ["Mozzarella", "Tomatensauce", "Schinken", "Pilze", "Origano"],
    "4 Käse": ["Mozzarella", "Tomatensauce", "Käse", "Origano"],
    "Thunfisch-Zwiebel": ["Mozzarella", "Tomatensauce", "Thunfisch", "Zwiebel", "Origano"],
    "Scharfe Salami": ["Mozzarella", "Tomatensauce", "Scharfe Salami", "Origano"]
}
;

var ingredientCategories = {
    "Choose Your Sauce": ["Tomatensauce"],
    "Choose Your Cheese": ["Mozzarella", "Büffelmozzarella", "Gorgonzola", "Ricotta", "Parmesan", "Kräutertopfen", "Schafskäse", "Käse", "Kräuterkäse"],
    "Choose Your Proteins": ["Schinken", "Speck", "Thunfisch", "Scharfe Salami", "Rohschinken", "Ei", "Spiegelei", "Bresaola", "Kaminwurz"],
    "Choose Your Vegetables": ["Mais", "Zucchini", "Spinach", "Spinat", "Pilze", "Artischocken", "Zwiebel", "Rucola", "Marinierte Tomaten", "Pfifferlinge", "Lombardi", "Peperonata", "Oliven", "Steinpilze"],
    "Choose Your Other Toppings": ["Knoblauch", "Basilikum", "Origano", "Kräuter", "Parmesansplitter", "Cocktailsauce", "Balsamico Glaze"]
};

function generatePizzaName(ingredients) {
    const baseNames = {
        "Tomatensauce": "Classic",
        "Mozzarella": "Cheesy",
        "Büffelmozzarella": "Buffalo",
        "Gorgonzola": "Gorgonzola",
        "Ricotta": "Ricotta",
        "Parmesan": "Parmesan",
        "Schinken": "Ham",
        "Speck": "Smoky",
        "Thunfisch": "Tuna",
        "Scharfe Salami": "Spicy",
        "Rohschinken": "Raw Ham",
        "Ei": "Eggy",
        "Spiegelei": "Sunny Egg",
        "Spinach": "Green",
        "Zwiebel": "Onion",
        "Mais": "Corn",
        "Zucchini": "Zucchini",
        "Pilze": "Mushroom",
        "Artischocken": "Artichoke",
        "Rucola": "Rocket",
        "Marinierte Tomaten": "Marinated Tomato",
        "Knoblauch": "Garlic",
        "Basilikum": "Basil",
        "Origano": "Oregano",
        "Peperonata": "Peppery",
        "Kräuter": "Herbal"
    };

    // Map ingredients to base names, filter out any that don't exist, and sort them alphabetically
    let nameParts = ingredients
        .map(ingredient => baseNames[ingredient] || "Custom")
        .sort();

    // Combine the names and append "Pizza" at the end
    return nameParts.length > 0 ? nameParts.join(" ") + " Pizza" : "Custom Pizza";
}
