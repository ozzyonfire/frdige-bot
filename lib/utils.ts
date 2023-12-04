import { useEffect, useState } from "react";
import { Fridge } from "./chat/bot";
import { get_fridge_contents } from "./chat/bot";

export function useFridge() {
	const [fridge, setFridge] = useState<Fridge>({
		items: []
	} as Fridge);

	useEffect(() => {
		get_fridge_contents().then(fridge_contents => {
			setFridge(fridge_contents);
		});

		const handler = (e: Event) => {
			get_fridge_contents().then(fridge_contents => {
				setFridge(fridge_contents);
			});
		}

		window.addEventListener('storage', handler);
		window.addEventListener('local-storage', handler);

		return () => {
			window.removeEventListener('storage', handler);
			window.removeEventListener('local-storage', handler);
		}
	}, []);

	return fridge;
}