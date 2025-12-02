const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { pageContentService } = require('../services');

const createPageContent = catchAsync(async (req, res) => {
  // Set author from authenticated user if not provided
  if (!req.body.author && req.user) {
    req.body.author = req.user.id;
  }

  const content = await pageContentService.createPageContent(req.body);
  res.status(httpStatus.CREATED).send(content);
});

const getPageContents = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['menuId', 'title', 'status', 'author', 'tags', 'isActive']);

  // Handle search
  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
        { excerpt: { $regex: searchTerm, $options: 'i' } },
      ];
    }
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) options.sortBy = 'updatedAt:desc';

  const result = await pageContentService.queryPageContents(filter, options);
  res.send(result);
});

const getPageContent = catchAsync(async (req, res) => {
  const content = await pageContentService.getPageContentById(req.params.contentId);
  if (!content) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Page content not found');
  }
  res.send(content);
});

const getPageContentBySlug = catchAsync(async (req, res) => {
  const includeUnpublished = req.query.preview === 'true';
  const content = await pageContentService.getPageContentBySlug(req.params.slug, includeUnpublished);
  if (!content) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Page content not found');
  }
  res.send(content);
});

const getPageContentsByMenu = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await pageContentService.getPageContentsByMenu(req.params.menuId, options);
  res.send(result);
});

const updatePageContent = catchAsync(async (req, res) => {
  const content = await pageContentService.updatePageContentById(req.params.contentId, req.body);
  res.send(content);
});

const deletePageContent = catchAsync(async (req, res) => {
  await pageContentService.deletePageContentById(req.params.contentId);
  res.status(httpStatus.NO_CONTENT).send();
});

const publishPageContent = catchAsync(async (req, res) => {
  const content = await pageContentService.publishPageContent(req.params.contentId);
  res.send(content);
});

const searchPageContents = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await pageContentService.searchPageContents(req.query.q, options);
  res.send(result);
});

module.exports = {
  createPageContent,
  getPageContents,
  getPageContent,
  getPageContentBySlug,
  getPageContentsByMenu,
  updatePageContent,
  deletePageContent,
  publishPageContent,
  searchPageContents,
};
