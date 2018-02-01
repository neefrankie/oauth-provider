/**
 * Tag function to trim sql statement is ES template string.
 */
module.exports = function sql(strings, ...values) {
	let output = '';
	for (let i = 0; i < values.length; i++) {
		output += strings[i] + values[i];
	}
	output += strings[values.length];

	let lines = output.split(/(?:\r\n|\n|\r)/g);

	return lines.map(line => {
		return line.replace(/^\s+|\s+$/gm, '');
	}).join(' ').trim();
};