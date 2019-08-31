export default function timeout(delay) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(delay);
		}, delay);
	});
}
