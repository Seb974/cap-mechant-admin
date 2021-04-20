export const getFormattedVariations = (variations, defaultVariation) => {
    if (variations && variations.length > 0) {
        return variations.map((variation, index) => {
            return {
                ...variation,
                count: index,
                name: variation.color,
                sizes: variation.sizes.map((size, i) => {
                    return {...size, count: i};
                })
            };
        });
    }
    return [defaultVariation];
};

export const getFormattedComponents = (components, defaultComponent) => {
    if (components && components.length > 0) {
        return components.map((component, index) => ({...component, count: index}))
    }
    return [defaultComponent];
};

export const createDescription = (product, components) => {
    let description = '"' + product.name + '" est composé de : ';
    components.map((component, index) => {
        let separator = index < components.length - 1 ? (index === components.length - 2 ? ' et ' : ', ') : '.';
        description += component.product.name + ' (' + (component.product.unit === 'Kg' ? '~ ' : '') + component.quantity + ' ' + component.product.unit + ')' + separator;
    });
    return description + ' Composition d\'environ ' + getTotalWeight(components) + ' Kg.';
};

export const getTotalWeight = (components) => {
    let totalWeight = 0;
    components.map((component) => {
        let unitWeight = component.product.weight === null || component.product.weight === undefined ? 1 : component.product.weight;
        totalWeight += unitWeight * component.quantity;
    });
    return totalWeight;
};

export const getProductToWrite = (product, type, categories, variations, components) => {
    const {image, stock,...noImgProduct} = product;
    return {
        ...noImgProduct,
        // stock: variations === null ? stock : null,
        stock: type === "simple" ? stock : null,
        userGroups: type === "mixed" ? null : product.userGroups.map(group => group.value), 
        tax: product.tax['@id'],
        categories: product.categories.map(category => categories.find(element => element.id === category.value)['@id']),
        stockManaged: type === "mixed" ? null : noImgProduct.stockManaged,
        unit: type === "mixed" ? "U" : noImgProduct.unit,
        fullDescription: type === "mixed" ? createDescription(product, components) : noImgProduct.fullDescription,
        weight: type === "mixed" ? getTotalWeight(components) : noImgProduct.weight.length <= 0 ? noImgProduct.weight : 1,
        prices: product.prices.map(price => ({...price, amount: parseFloat(price.amount), priceGroup: price.priceGroup['@id']})),
        variations,
        components
    };
};

export const getComponentsToWrite = (components) => {
    return components.map(component => {
        const { count, variation, size, ...mainVarComponent} = component;
        const minComponent = {...mainVarComponent, product: mainVarComponent.product['@id'], quantity: parseFloat(mainVarComponent.quantity) };
        return variation === null || variation === undefined ? minComponent : {...minComponent, variation: variation['@id'], size: size['@id']};
    });
};

export const getVariationToWrite = (variation, product) => {
    const {image, ...noImgVar} = variation;
    return {
        ...noImgVar,
        color: variation.name,
        sizes: variation.sizes.map(size => {
            return {
                ...size,
                name: size.name,
                stock: {
                    ...size.stock,
                    quantity: size.stock !== undefined && size.stock !== null && size.stock.quantity ? size.stock.quantity : 0,
                    alert: parseFloat(product.stock.alert), 
                    security: parseFloat(product.stock.security)
                }
            }
        })
    };
};

export const defineType = (product) => {
    return product.isMixed ? "mixed" : product.variations && product.variations.length > 0 ? "with-variations" : "simple";
};

export const formatProduct = (product, defaultStock) => {
    const {prices, categories, stock, variations} = product;
    const basePrice = prices !== null && prices !== undefined && prices.length > 0 ? prices[0].amount : "";
    const formattedProduct = {
        ...product, 
        userGroups: product.userGroups.map(group => ({value: group})),
        categories: categories.map(category => ({value: category.id, label: category.name, isFixed: false})),
        uniquePrice: prices !== null && prices !== undefined && prices.length > 0 ? prices.every(price => price.amount === basePrice) : true,
        stock: stock !== null && stock !== undefined ? stock : 
                variations && variations.length > 0 ? variations[0].sizes[0].stock : defaultStock
    };
    return formattedProduct;
};

// export {
//     getFormattedVariations,
//     getFormattedComponents,
//     createDescription,
//     getTotalWeight
// }