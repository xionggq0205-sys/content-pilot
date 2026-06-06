import { Platform, ContentVersion, PLATFORM_CONFIG } from '@/types';

// 平台适配器接口
export interface PlatformAdapter {
  platform: Platform;
  publish(content: ContentVersion): Promise<{ success: boolean; url?: string; error?: string }>;
  validate(content: ContentVersion): { valid: boolean; errors: string[] };
  export(content: ContentVersion): string; // 导出为该平台标准格式
}

// ============ 公众号适配器 ============
export class WechatAdapter implements PlatformAdapter {
  platform: Platform = 'wechat';
  private proxyUrl: string;
  private appid: string;
  private secret: string;

  constructor() {
    this.proxyUrl = process.env.WECHAT_PROXY_URL || 'http://124.221.114.126:8443/cgi-bin/';
    this.appid = process.env.WECHAT_APPID || '';
    this.secret = process.env.WECHAT_SECRET || '';
  }

  async publish(content: ContentVersion): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Step 1: 获取access_token
      const tokenRes = await fetch(
        `${this.proxyUrl}token?grant_type=client_credential&appid=${this.appid}&secret=${this.secret}`
      );
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return { success: false, error: '获取access_token失败' };
      }

      // Step 2: 上传封面图（如有）
      let thumbMediaId: string | undefined;
      if (content.coverImageUrl) {
        const uploadRes = await fetch(`${this.proxyUrl}media/uploadimg?access_token=${accessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media: content.coverImageUrl }),
        });
        const uploadData = await uploadRes.json();
        thumbMediaId = uploadData.media_id;
      }

      // Step 3: 创建草稿
      const draftRes = await fetch(`${this.proxyUrl}draft/add?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: [{
            title: content.title,
            author: '跳舞的熊',
            content: this.formatHtml(content),
            thumb_media_id: thumbMediaId,
            digest: content.body.slice(0, 120),
          }],
        }),
      });
      const draftData = await draftRes.json();

      if (draftData.media_id) {
        return { success: true, url: `draft:${draftData.media_id}` };
      } else {
        return { success: false, error: draftData.errmsg || '创建草稿失败' };
      }
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  validate(content: ContentVersion): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = PLATFORM_CONFIG.wechat;

    if (!content.title) errors.push('标题不能为空');
    if (content.title.length > config.maxTitleLength) errors.push(`标题不能超过${config.maxTitleLength}字`);
    if (!content.body) errors.push('正文不能为空');
    if (content.wordCount < 500) errors.push('公众号文章建议≥500字');

    return { valid: errors.length === 0, errors };
  }

  export(content: ContentVersion): string {
    return this.formatMarkdown(content);
  }

  private formatHtml(content: ContentVersion): string {
    // 将Markdown风格内容转换为公众号HTML
    return content.body
      .split('\n\n')
      .map(p => `<p style="margin: 1em 0; line-height: 1.8; font-size: 16px;">${p}</p>`)
      .join('')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/## (.*)/g, '<h2 style="font-size: 20px; font-weight: bold; margin: 1.5em 0 0.5em;">$1</h2>');
  }

  private formatMarkdown(content: ContentVersion): string {
    return `# ${content.title}\n\n${content.body}\n\n---\n\n标签: ${content.tags.join(' #')}`;
  }
}

// ============ 小红书适配器 ============
export class XiaohongshuAdapter implements PlatformAdapter {
  platform: Platform = 'xiaohongshu';

  async publish(): Promise<{ success: boolean; error?: string }> {
    // MVP阶段不支持直发，导出文件后手动发布
    return { success: false, error: '小红书暂不支持自动发布，请导出后手动发布' };
  }

  validate(content: ContentVersion): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = PLATFORM_CONFIG.xiaohongshu;

    if (!content.title) errors.push('标题不能为空');
    if (content.title.length > config.maxTitleLength) errors.push(`标题不能超过${config.maxTitleLength}字`);
    if (content.wordCount > config.maxContentLength) errors.push(`正文不能超过${config.maxContentLength}字`);
    if (content.tags.length < 2) errors.push('建议至少2个标签');

    return { valid: errors.length === 0, errors };
  }

  export(content: ContentVersion): string {
    const tags = content.tags.map(t => `#${t}`).join(' ');
    return `${content.title}\n\n${content.body}\n\n${tags}`;
  }
}

// ============ 抖音适配器 ============
export class DouyinAdapter implements PlatformAdapter {
  platform: Platform = 'douyin';

  async publish(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: '抖音暂不支持自动发布' };
  }

  validate(content: ContentVersion): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = PLATFORM_CONFIG.douyin;

    if (!content.title) errors.push('标题不能为空');
    if (content.title.length > config.maxTitleLength) errors.push(`标题不能超过${config.maxTitleLength}字`);
    if (content.wordCount > config.maxContentLength) errors.push(`口播脚本不能超过${config.maxContentLength}字`);

    return { valid: errors.length === 0, errors };
  }

  export(content: ContentVersion): string {
    const tags = content.tags.map(t => `#${t}`).join(' ');
    return `【口播脚本】\n\n${content.title}\n\n${content.body}\n\n${tags}`;
  }
}

// ============ B站适配器 ============
export class BilibiliAdapter implements PlatformAdapter {
  platform: Platform = 'bilibili';

  async publish(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'B站暂不支持自动发布' };
  }

  validate(content: ContentVersion): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = PLATFORM_CONFIG.bilibili;

    if (!content.title) errors.push('标题不能为空');
    if (content.title.length > config.maxTitleLength) errors.push(`标题不能超过${config.maxTitleLength}字`);

    return { valid: errors.length === 0, errors };
  }

  export(content: ContentVersion): string {
    const tags = content.tags.map(t => `#${t}`).join(' ');
    return `# ${content.title}\n\n${content.body}\n\n---\n\n${tags}`;
  }
}

// ============ 适配器工厂 ============
const adapters: Record<Platform, PlatformAdapter> = {
  xiaohongshu: new XiaohongshuAdapter(),
  wechat: new WechatAdapter(),
  douyin: new DouyinAdapter(),
  bilibili: new BilibiliAdapter(),
};

export function getAdapter(platform: Platform): PlatformAdapter {
  return adapters[platform];
}
