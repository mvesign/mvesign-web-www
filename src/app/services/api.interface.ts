export interface IArticle {
    reference: string;
    title: string;
    content: string;
    createdOn: Date;
    tags: string[];
}

export interface IArticleSummary {
    currentPage: number;
    itemsPerPage: number;
    numberOfItems: number;
    numberOfPages: number;
}