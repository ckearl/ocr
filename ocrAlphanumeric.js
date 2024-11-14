import Tesseract from "tesseract.js";

export async function ocrAlphanumeric(imageData) {
	try {
		const { data } = await Tesseract.recognize(imageData, "eng", {
			logger: (m) => console.log(m),
			rectangle: true,
			words: true,
			// Configuration for better character detection
			tessedit_char_whitelist:
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
			tessjs_create_pdf: "1",
			tessjs_create_hocr: "1",
			tessjs_create_tsv: "1",
			tessjs_create_box: "1",
			tessedit_pageseg_mode: "6", // Assume uniform text block
			tessedit_ocr_engine_mode: "3", // Default + LSTM
			preserve_interword_spaces: "1",
			textord_heavy_nr: "1",
			textord_force_make_prop_words: "1",
			tessedit_do_invert: "0",
		});

		const charPositions = data.words.flatMap((word) => {
			return word.symbols.map((symbol) => ({
				char: symbol.text,
				x: symbol.bbox.x0,
				y: symbol.bbox.y0,
				width: symbol.bbox.x1 - symbol.bbox.x0,
				height: symbol.bbox.y1 - symbol.bbox.y0,
				confidence: symbol.confidence,
			}));
		});

		return charPositions;
	} catch (err) {
		console.error("Error performing OCR:", err);
		throw err;
	}
}
