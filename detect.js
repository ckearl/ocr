import { ocrAlphanumeric } from "./ocrAlphanumeric.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define expected keyboard characters
const expectedChars = {
	numbers: "0123456789",
	letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
};

function analyzeDetectedChars(detectedChars) {
	// Convert detected chars to uppercase for consistent comparison
	const detectedSet = new Set(
		detectedChars.map((char) => char.char.toUpperCase())
	);

	// Analysis results
	const results = {
		missingNumbers: [],
		missingLetters: [],
		unexpectedChars: [],
		duplicates: [],
		totalDetected: detectedChars.length,
	};

	// Check for missing numbers
	for (const num of expectedChars.numbers) {
		if (!detectedSet.has(num)) {
			results.missingNumbers.push(num);
		}
	}

	// Check for missing letters
	for (const letter of expectedChars.letters) {
		if (!detectedSet.has(letter)) {
			results.missingLetters.push(letter);
		}
	}

	// Find unexpected and duplicate characters
	const charCount = new Map();
	detectedChars.forEach((char) => {
		const upperChar = char.char.toUpperCase();
		charCount.set(upperChar, (charCount.get(upperChar) || 0) + 1);

		// Check if character is unexpected
		if (
			!expectedChars.numbers.includes(upperChar) &&
			!expectedChars.letters.includes(upperChar)
		) {
			results.unexpectedChars.push(char.char);
		}
	});

	// Find duplicates
	charCount.forEach((count, char) => {
		if (count > 1) {
			results.duplicates.push({ char, count });
		}
	});

	return results;
}

async function main() {
	try {
		const imagePath = path.join(__dirname, "silver-macbook-air.jpg");
		const imageBuffer = await fs.readFile(imagePath);
		const base64Image = `data:image/jpeg;base64,${imageBuffer.toString(
			"base64"
		)}`;

		const detectedChars = await ocrAlphanumeric(base64Image);

		// Print detected characters with coordinates
		console.log("\nDetected Characters:");
		detectedChars.forEach((char) => {
			console.log(
				`Character: ${char.char}, X: ${char.x}, Y: ${char.y}, Width: ${char.width}, Height: ${char.height}`
			);
		});

		// Analyze results
		const analysis = analyzeDetectedChars(detectedChars);

		// Print analysis
		console.log("\n=== Analysis Results ===");
		console.log(`Total Characters Detected: ${analysis.totalDetected}`);

		console.log(
			"\nMissing Numbers:",
			analysis.missingNumbers.length
				? analysis.missingNumbers.join(", ")
				: "None"
		);

		console.log(
			"\nMissing Letters:",
			analysis.missingLetters.length
				? analysis.missingLetters.join(", ")
				: "None"
		);

		console.log(
			"\nUnexpected Characters:",
			analysis.unexpectedChars.length
				? [...new Set(analysis.unexpectedChars)].join(", ")
				: "None"
		);

		console.log("\nDuplicate Characters:");
		analysis.duplicates.forEach(({ char, count }) => {
			console.log(`${char}: found ${count} times`);
		});
	} catch (error) {
		console.error("Error:", error.message);
		if (error.stack) console.error(error.stack);
	}
}

main();
