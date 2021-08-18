import request from '../../utils/request'

// 获取新闻列表
export const getNewsList = (source, tag, page)=>{
  return request.get(`/News/getList/source/${source}/tag/${tag}/page/${page}`)
}

// 获取新闻标签
export const getNewsTag = (source)=>{
  return request.get(`/News/getTagsV2/source/${source}`)
}