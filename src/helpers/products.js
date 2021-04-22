import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

export const getFormattedVariations = (variations, defaultVariation) => {
    if ( isDefinedAndNotVoid(variations) ) {
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
    if ( isDefinedAndNotVoid(components) ) {
        return components.map((component, index) => ({...component, count: index}))
    }
    return [defaultComponent];
};

export const createDescription = (product, components) => {
    let description = '"' + product.name + '" est composé de : ';
    components.map((component, index) => {
        const { product, quantity } = component;
        let separator = index < components.length - 1 ? (index === components.length - 2 ? ' et ' : ', ') : '.';
        description += product.name + getVariationDetails(component) + ' (' + (product.unit === 'Kg' ? '~ ' : '') + quantity + ' ' + product.unit + ')' + separator;
    });
    return description + ' Composition d\'environ ' + getTotalWeight(components) + ' Kg.';
};

const getVariationDetails = ({ variation, size }) => {
    const sizeDetails = !isDefined(size) ? "" : " " + size.name;
    return !isDefined(variation) ? "" :
    ' ' + variation.color + sizeDetails;
};

export const getTotalWeight = (components) => {
    let totalWeight = 0;
    components.map((component) => {
        let unitWeight = !isDefined(component.product.weight) ? 1 : component.product.weight;
        totalWeight += unitWeight * component.quantity;
    });
    return totalWeight;
};

export const getProductToWrite = (product, type, categories, variations, adaptedComponents, components) => {
    const {image, stock,...noImgProduct} = product;
    return {
        ...noImgProduct,
        stock: type === "simple" ? stock : null,
        userGroups: null,
        productGroup: type === "mixed" ? null : product.productGroup,
        tax: product.tax['@id'],
        categories: product.categories.map(category => categories.find(element => element.id === category.value)['@id']),
        stockManaged: type === "mixed" ? null : noImgProduct.stockManaged,
        unit: type === "mixed" ? "U" : noImgProduct.unit,
        fullDescription: type === "mixed" ? createDescription(product, components) : noImgProduct.fullDescription,
        weight: type === "mixed" ? getTotalWeight(components) : product.unit === "Kg" ? 1 : noImgProduct.weight.length <= 0 ? noImgProduct.weight : 1,
        prices: product.prices.map(price => ({...price, amount: parseFloat(price.amount), priceGroup: price.priceGroup['@id']})),
        components: adaptedComponents,
        variations
    };
};

export const getComponentsToWrite = (components) => {
    return components.map(component => {
        const { count, variation, size, ...mainVarComponent} = component;
        const minComponent = {...mainVarComponent, product: mainVarComponent.product['@id'], quantity: parseFloat(mainVarComponent.quantity) };
        return !isDefined(variation) ? minComponent : {...minComponent, variation: variation['@id'], size: size['@id']};
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
                    quantity: isDefined(size.stock) && isDefined(size.stock.quantity) ? size.stock.quantity : 0,
                    alert: parseFloat(product.stock.alert), 
                    security: parseFloat(product.stock.security)
                }
            }
        })
    };
};

export const defineType = (product) => {
    return product.isMixed ? "mixed" : isDefinedAndNotVoid(product.variations) ? "with-variations" : "simple";
};

export const formatProduct = (product, defaultStock) => {
    const {prices, categories, stock, variations} = product;
    const basePrice = isDefinedAndNotVoid(prices) ? prices[0].amount : "";
    const formattedProduct = {
        ...product, 
        userGroups: isDefinedAndNotVoid(product.userGroups) ? isDefined(product.userGroups[0].label) ? product.userGroups : product.userGroups.map(group => ({value: group})) : [],
        categories: categories.map(category => ({value: category.id, label: category.name, isFixed: false})),
        uniquePrice: isDefinedAndNotVoid(prices) ? prices.every(price => price.amount === basePrice) : true,
        stock: isDefined(stock) ? stock : isDefinedAndNotVoid(variations) ? variations[0].sizes[0].stock : defaultStock
    };
    return formattedProduct;
};