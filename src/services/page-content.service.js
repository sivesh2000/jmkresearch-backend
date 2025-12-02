const httpStatus = require('http-status');
const { PageContent, Menu } = require('../models');
const ApiError = require('../utils/ApiError');

const createPageContent = async (contentBody) => {
  // Validate menu exists
  if (!(await Menu.findById(contentBody.menuId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Menu not found');
  }

  // Check if slug already exists
  if (await PageContent.findOne({ slug: contentBody.slug })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already exists');
  }

  return PageContent.create(contentBody);
};

const queryPageContents = async (filter, options) => {
  const contents = await PageContent.paginate(filter, {
    ...options,
    populate: 'menuId,author',
  });
  return contents;
};

const getPageContentById = async (id) => {
  return PageContent.findById(id).populate('menuId', 'title slug').populate('author', 'name email');
};

const getPageContentBySlug = async (slug, includeUnpublished = false) => {
  const filter = { slug, isActive: true };
  if (!includeUnpublished) {
    filter.status = 'published';
    filter.publishedAt = { $lte: new Date() };
  }

  const content = await PageContent.findOne(filter).populate('menuId', 'title slug').populate('author', 'name email');

  if (content && !includeUnpublished) {
    // Increment view count for published content
    await PageContent.findByIdAndUpdate(content._id, { $inc: { viewCount: 1 } });
  }

  return content;
};

const getPageContentsByMenu = async (menuId, options = {}) => {
  const filter = {
    menuId,
    isActive: true,
    status: 'published',
    publishedAt: { $lte: new Date() },
  };

  return PageContent.paginate(filter, {
    ...options,
    populate: 'author',
    sort: options.sortBy || 'publishedAt:-1',
  });
};

const updatePageContentById = async (contentId, updateBody) => {
  const content = await getPageContentById(contentId);
  if (!content) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Page content not found');
  }

  // Validate menu if being updated
  if (updateBody.menuId && updateBody.menuId !== (content.menuId && content.menuId.toString())) {
    if (!(await Menu.findById(updateBody.menuId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Menu not found');
    }
  }

  // Check slug uniqueness if being updated
  if (updateBody.slug && updateBody.slug !== content.slug) {
    if (await PageContent.findOne({ slug: updateBody.slug, _id: { $ne: contentId } })) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already exists');
    }
  }

  Object.assign(content, updateBody);
  await content.save();
  return content;
};

const deletePageContentById = async (contentId) => {
  const content = await getPageContentById(contentId);
  if (!content) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Page content not found');
  }

  await content.deleteOne();
  return content;
};

const publishPageContent = async (contentId) => {
  const content = await getPageContentById(contentId);
  if (!content) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Page content not found');
  }

  content.status = 'published';
  content.publishedAt = new Date();
  await content.save();
  return content;
};

const searchPageContents = async (searchTerm, options = {}) => {
  const filter = {
    isActive: true,
    status: 'published',
    publishedAt: { $lte: new Date() },
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { excerpt: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } },
    ],
  };

  return PageContent.paginate(filter, {
    ...options,
    populate: 'menuId,author',
    sort: options.sortBy || 'publishedAt:-1',
  });
};

module.exports = {
  createPageContent,
  queryPageContents,
  getPageContentById,
  getPageContentBySlug,
  getPageContentsByMenu,
  updatePageContentById,
  deletePageContentById,
  publishPageContent,
  searchPageContents,
};
