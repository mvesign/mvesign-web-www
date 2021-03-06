export interface IArticle {
    reference: string;
    title: string;
    createdOn: Date;
    tags: string[];
    snippets: ISnippet[];
    references: string[];
}

export interface IArticleSummary {
    currentPage: number;
    itemsPerPage: number;
    numberOfItems: number;
    numberOfPages: number;
}

export interface ISnippet {
    type: string;
    value: string;
    language: string;
}