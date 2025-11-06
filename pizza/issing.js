var pizzas = {
    "Pizza Marinara": ["Tomatensauce", "Knoblauch"],
    "Pizza Margherita": ["Tomatensauce", "Mozzarella fior di latte"],
    "Scharfe Salami": ["Tomatensauce", "Mozzarella fior di latte", "Scharfe Salami"],
    "Pizza Schinken": ["Tomatensauce", "Mozzarella fior di latte", "Schinken"],
    "Tunfisch Mais": ["Tomatensauce", "Mozzarella fior di latte", "Tonno", "Mais"],
    "Pizza Gorgonzola": ["Tomatensauce", "Mozzarella fior di latte", "Gorgonzola"],
    "Pizza Napoletana": ["Tomatensauce", "Büffelmozzarella", "Parmesan", "Basilikum"],
    "Pizza Siciliana": ["Tomatensauce", "Mozzarella fior di latte", "Scharfe Salami", "Peperonata", "Knoblauch"],
    "Pizza 4 Stagioni": ["Tomatensauce", "Mozzarella fior di latte", "Schinken", "Pilze", "Artischocken", "Oliven"],

    "Pizza Diavolo": ["Tomatensauce", "Mozzarella fior di latte", "Scharfe Salami", "Oliven", "Lombardi", "Peperonata"],
    "Pizza Capricciosa": ["Tomatensauce", "Mozzarella fior di latte", "Schinken", "Pilze", "Artischocken"],
    "Pizza Calabrese": ["Tomatensauce", "Büffelmozzarella", "Riesen Kapern", "Taggiasca Oliven", "Knoblauch", "Scharfe Salami"],
    "Pizza Mesico": ["Tomatensauce", "Mozzarella fior di latte", "Scharfe Salami", "Lombardi", "Mais", "Peperonata"],
    "Pizza Englisch": ["Tomatensauce", "Mozzarella fior di latte", "Speck", "Peperonata", "Zwiebel", "Spiegelei"],
    "Fire and Ice": ["Tomatensauce", "Mozzarella fior di latte", "Spinat", "Gekochtes Ei", "Scharfe Salami", "Knoblauch", "Zwiebel"]
};

var ingredientCategories = {
    "Choose Your Sauce": ["Tomatensauce"],
    "Choose Your Cheese": ["Mozzarella fior di latte", "Büffelmozzarella", "Gorgonzola"],
    "Choose Your Proteins": ["Schinken", "Speck", "Tonno", "Scharfe Salami"],
    "Choose Your Vegetables": ["Mais", "Artischocken", "Pilze", "Peperonata", "Spinat", "Zwiebel", "Oliven", "Taggiasca Oliven", "Riesen Kapern", "Lombardi"],
    "Choose Your Other Toppings": ["Knoblauch", "Basilikum", "Parmesan", "Spiegelei", "Gekochtes Ei"]
};

function generatePizzaName(ingredients) {
    const baseNames = {
        "Tomatensauce": "Inferno",
        "Mozzarella fior di latte": "Mozzarella",
        "Büffelmozzarella": "Buffalo",
        "Scharfe Salami": "Spicy",
        "Speck": "Smoky",
        "Tonno": "Tuna",
        "Pilze": "Mushroom",
        "Spinat": "Spinach",
        "Gorgonzola": "Gorgonzola",
        "Parmesan": "Parmesan",
        "Schinken": "Ham",
        "Prosciutto Cotto": "Prosciutto",
        "Mais": "Corn",
        "Artischocken": "Artichoke",
        "Zwiebel": "Onion",
        "Oliven": "Olive",
        "Riesen Kapern": "Capers",
        "Lombardi": "Pepper"
    };

    let nameParts = ingredients.map(ingredient => baseNames[ingredient] || "Custom").sort();
    return nameParts.length > 0 ? nameParts.join(" ") + " Pizza" : "Custom Pizza";
}