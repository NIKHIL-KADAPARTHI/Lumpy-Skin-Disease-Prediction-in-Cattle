// src/api.ts

export interface PredictResponse {
    assessment: string;
    annotated_image: string;
}

export async function predictAssessment(address: string, imageFile: File): Promise<PredictResponse> {
    const formData = new FormData();
    formData.append("address", address);
    formData.append("image", imageFile);

    const response = await fetch("https://lsd-bolt-server.onrender.com/predict", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
}
