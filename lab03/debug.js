// Part C - corrected version of the broken findLegend script.
const legends = ["Turing", "Shannon", "Hopper"];

function findLegend(name) {
  for (let i = 0; i < legends.length; i++) {
    if (legends[i].toLowerCase() === name.toLowerCase()) {
      return `Found: ${legends[i]}`;
    }
  }
  return "Not found";
}

console.log(findLegend("shannon")); // Found: Shannon
console.log(findLegend("lovelace")); // Not found
