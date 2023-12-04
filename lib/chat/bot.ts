'use client';

// this file describes the tools that the bot can use on the client side

export interface Fridge {
	items: {
		ingredient: string,
		quantity: number
	}[]
}

/** 
 *  save the ingredient to the local storage of the device
 */
export const add_ingredient_to_fridge = async (args: { ingredient: string, quantity: number }) => {
	const { ingredient, quantity } = args;
	const fridge_contents = await get_fridge_contents();
	fridge_contents.items.push({
		ingredient,
		quantity
	});
	localStorage.setItem('fridge', JSON.stringify(fridge_contents));
	window.dispatchEvent(new Event('local-storage'));
	return {
		message: `Added ${ingredient} to the fridge`,
	}
}

/**
 *  Get the contents of the fridge from the local storage of the device 
 */
export const get_fridge_contents = async () => {
	const fridge_contents = localStorage.getItem('fridge');
	if (!fridge_contents) {
		return {
			items: []
		} as Fridge;
	}
	return JSON.parse(fridge_contents) as Fridge;
}

/**
 * 
 * @param indredientIndex Which item index to edit or remove
 * @param quantity The new quantity. A quantity of 0 will remove the item from the fridge.
 * @returns Success message
 */
export const edit_fridge_contents = async (args: { indredientIndex: number, quantity: number }) => {
	const { indredientIndex, quantity } = args;
	const fridge_contents = await get_fridge_contents();
	if (quantity == 0) {
		fridge_contents.items.splice(indredientIndex, 1);
		localStorage.setItem('fridge', JSON.stringify(fridge_contents));
		window.dispatchEvent(new Event('local-storage'));
		return {
			message:
				`Removed item from the fridge`
		};
	}
	fridge_contents.items[indredientIndex].quantity = quantity;
	localStorage.setItem('fridge', JSON.stringify(fridge_contents));
	window.dispatchEvent(new Event('local-storage'));
	return { message: `Edited ${fridge_contents.items[indredientIndex].ingredient} to ${quantity}` };
}

export const tools = {
	add_ingredient_to_fridge,
	get_fridge_contents,
	edit_fridge_contents
}