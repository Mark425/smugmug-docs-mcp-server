export const smugMugDocs = [
    {
        id: "overview",
        title: "SmugMug API overview",
        summary: "Welcome page for the SmugMug API reference.",
        url: "https://api.smugmug.com/api/v2/doc/index.html",
        keywords: ["overview", "welcome", "api", "introduction"]
    },
    {
        id: "tutorial-api-key",
        title: "Getting an API key",
        summary: "How to request and manage SmugMug API credentials.",
        url: "https://api.smugmug.com/api/v2/doc/tutorial/api-key.html",
        keywords: ["api key", "credentials", "auth", "access"]
    },
    {
        id: "tutorial-basics",
        title: "SmugMug API basics",
        summary: "The basics of making requests and interpreting responses.",
        url: "https://api.smugmug.com/api/v2/doc/tutorial/basics.html",
        keywords: ["basics", "requests", "responses", "http"]
    },
    {
        id: "concepts",
        title: "API concepts",
        summary: "Core concepts such as methods, object identifiers, and status codes.",
        url: "https://api.smugmug.com/api/v2/doc/pages/concepts.html",
        keywords: ["concepts", "methods", "status codes", "identifiers"]
    },
    {
        id: "reference-user",
        title: "User reference",
        summary: "Reference docs for the User resource.",
        url: "https://api.smugmug.com/api/v2/doc/reference/user.html",
        keywords: ["user", "profile", "account"]
    },
    {
        id: "reference-album",
        title: "Album reference",
        summary: "Reference docs for Albums and album-related operations.",
        url: "https://api.smugmug.com/api/v2/doc/reference/album.html",
        keywords: ["album", "albums", "photos"]
    },
    {
        id: "reference-image",
        title: "Image reference",
        summary: "Reference docs for Images and image metadata operations.",
        url: "https://api.smugmug.com/api/v2/doc/reference/image.html",
        keywords: ["image", "images", "metadata", "upload"]
    }
];
export function searchSmugMugDocs(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
        return smugMugDocs.slice(0, 5);
    }
    return smugMugDocs.filter((entry) => {
        const haystack = [entry.title, entry.summary, ...entry.keywords].join(" ").toLowerCase();
        return haystack.includes(normalized);
    });
}
export async function fetchSmugMugDocPage(input) {
    const raw = input.trim();
    const url = raw.startsWith("http")
        ? raw
        : `https://api.smugmug.com/api/v2/doc/${raw.replace(/^\/+/, "")}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }
    const html = await response.text();
    const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ")
        .trim();
    return {
        url,
        text: text.slice(0, 6000)
    };
}
