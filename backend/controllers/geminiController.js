// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//     apiKey:process.env.GEMINI_API_KEY
// })

// const explainCode = async (req,res) => {
//     try {
//         const {code} = req.body
//         if(!code || typeof code !=="string" || !code.trim()){
//             return res.status(400).json({
//                 message:"Please provide code to explain."
//             })
//         }
//         const response = await ai.models.generateContent({
//             model:"gemini-3.8-flash",
//             contents:`Explain this code in simple English. Explain what is does , how it works , and its important functions. code: ${code}`
//         })
//         return res.status(200).json({
//             message:"Code explained sucessfully!",
//             explanation:response.text
//         })
//     } catch (error) {
//         console.error("Explanation error: ",error.message);

//         return res.status(500).json({
//             message:"Failed to explain code."
//         })
//     }
// }

// export {explainCode}




import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;


const ai = new GoogleGenAI({
    apiKey: apiKey,
    vertexai: false
});

const explainCode = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code || typeof code !== "string" || !code.trim()) {
            return res.status(400).json({
                message: "Please provide code to explain."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Explain the following code in simple English.

Explain:
1. What the code does.
2. How it works, step by step.
3. The purpose of important functions and variables.
4. The input parameters and return values.
5. A simple example of the output.

FORMATTING RULES:
- Return plain text only.
- Do not use Markdown.
- Do not use # headings, **bold**, bullet symbols, backticks, or Markdown code blocks.
- Use simple section titles on separate lines.
- Use numbered paragraphs where needed.
- Do not invent details.

Code:
${code}`
        });

        return res.status(200).json({
            message: "Code explained successfully!",
            explanation: response.text
        });

    } catch (error) {
        console.error("Explanation error:", error);

        return res.status(500).json({
            message: "Failed to explain code.",
            error: error.message
        });
    }
};


const generateReadme = async (req, res) => {
    try {
        const { projectName, description, code, technologies } = req.body;

        if (!projectName || !projectName.trim()) {
            return res.status(400).json({
                message: "Project name is required."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a clear project README for the following project.

Project Name: ${projectName}
Description: ${description || "Not provided"}
Technologies: ${technologies || "Not provided"}
Code:
${code || "No code provided"}

Include:
1. Project overview
2. Main features
3. Technologies used
4. Installation instructions
5. Environment variables, if applicable
6. How to run the project
7. API endpoints, if identifiable
8. Future improvements

FORMATTING RULES:
- Return plain text only.
- Do not use Markdown headings, bold text, bullet symbols, backticks, or code blocks.
- Use simple section titles on separate lines.
- Use numbered paragraphs where needed.
- Do not invent commands, API endpoints, or configuration details.
- Mark unknown information as "Not provided".
- Do not include actual secret keys.

Project details:
${description || "No additional details provided."}`
        })

        return res.status(200).json({
            message: "README generated successfully!",
            readme: response.text
        });

    } catch (error) {
        console.error("Generate README error:", error);

        return res.status(500).json({
            message: "Failed to generate README.",
            error: error.message
        });
    }
};

const generateDocumentation = async (req, res) => {
    try {
        const { code, language, fileName } = req.body;

        if (!code || typeof code !== "string" || !code.trim()) {
            return res.status(400).json({
                message: "Please provide code to document."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate technical documentation for the following code in plain text.

File name: ${fileName || "Not provided"}
Programming language: ${language || "Detect from the code"}

Explain:
1. The purpose of the code.
2. Each important function or class.
3. Parameters and return values.
4. How the code works.
5. Example usage.
6. Important errors or edge cases.

FORMATTING RULES:
- Return plain text only.
- Do not use Markdown headings, bold text, bullet symbols, backticks, or code blocks.
- Use simple section titles on separate lines.
- Use simple English.
- Do not invent details.

Code:
${code}`
        });

        return res.status(200).json({
            message: "Documentation generated successfully!",
            documentation: response.text
        });

    } catch (error) {
        console.error("Generate documentation error:", error);

        return res.status(500).json({
            message: "Failed to generate documentation.",
            error: error.message
        });
    }
};


export { explainCode, generateReadme, generateDocumentation }
