<template>
  <el-drawer :title="title" :visible="drawer" :with-header="withHeader"
             :destroy-on-close="destroyOnClose" :modal-append-to-body="false" :append-to-body="true"
             @open="init"
             :direction="direction" :size="size" v-loading="loading">
    <div class="drawer-top">
      <div class="top-btn" v-if="!isFolder&&!isMultiple">
        <div class="btn" style="margin-right: 24px" v-for="item in topBtn" :key="item.icon" v-show="item.show"
             @click="handleBtn(item.icon)">
          <i :class="item.icon"/>
          {{ item.label }}
        </div>
      </div>
      <div v-else></div>
      <div style="display: flex;align-items: center">
        <div class="btn" @click="closeDrawer('close')">
          取消
        </div>
        <el-dropdown size="medium" split-button type="primary" @click="closeDrawer('saveAndClose')"
                     @command="closeDrawer">
          保存并关闭
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="save">保存</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="info-item">
      <template v-if="!isFolder">
        <div class="info-title" v-if="detailData.metadata">
          {{ detailData.metadata['dc:title'] || name }}
        </div>
        <div class="info-title" v-else>
          {{ name }}
        </div>
      </template>
      <template v-else>
        <div class="info-title" v-if="detailData.properties">
          {{ detailData.properties['jcr:title'] || name }}
        </div>
      </template>
      <div class="info-title" v-if="isMultiple">资产元数据</div>
    </div>
    <div v-if="!isFolder" class="info-content">
      <div class="left-info">
        <template v-if="!isMultiple">
          <el-image
            v-if="detailData.renditions"
            :src="`${baseUrl}${detailData.renditions.detail}`">
            <div slot="error" class="image-slot">
              <i class="el-icon-document" style="font-size: 120px;color: #323232"></i>
            </div>
          </el-image>
          <div class="left-name">
            <div v-if="detailData.metadata">{{ detailData.metadata['dc:title'] }}</div>
            <div>{{ name }}</div>
          </div>
        </template>
        <template v-else>
          <div v-for="item in multipleData" :key="item.assetId" class="multiple-list">
            <el-image class="image" v-if="item.renditions" :src="`${baseUrl}${item.renditions.column}`" fit="cover">
              <div slot="error" class="image-slot">
                <i class="el-icon-document" style="font-size: 20px;color: #323232"></i>
              </div>
            </el-image>
            <div class="name">{{ item.name }}</div>
          </div>
        </template>
      </div>
      <div style="border-right: 1px solid #d2d2d2;display: block;"></div>
      <div class="right-tab">
        <el-tabs v-model="selectTab">
          <el-tab-pane v-for="item in tabs" :key="item.key" :label="item.label" :name="item.key">
            <div v-if="item.key==='essential'" style="display: flex">
              <div class="info-list-item">
                <div class="title-item">
                  <h3>元数据</h3>
                </div>
                <el-form label-position="top" ref="metadataForm" :model="metadata" :rules="metadataFormRules">
                  <el-form-item label="名称" prop="title">
                    <el-input v-model.trim="metadata.title"></el-input>
                  </el-form-item>
                  <el-form-item label="描述" prop="description">
                    <el-input v-model.trim="metadata.description"></el-input>
                  </el-form-item>
                  <el-form-item label="类型" v-if="!isMultiple">
                    <el-input v-model="metadata.type" disabled></el-input>
                  </el-form-item>
                  <!--                  <el-form-item label="语言">-->
                  <!--                    <el-select style="width: 100%" v-model="metadata.language" placeholder="选择选项">-->
                  <!--                    </el-select>-->
                  <!--                  </el-form-item>-->
                  <el-form-item label="标记">
                    <div style="display: flex;align-items: center;">
                      <el-select v-model="metadata.tags" multiple style="flex: 1;"
                                 @visible-change="handleSelectTag">
                        <el-option
                          v-for="item in tagOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                      <el-popover v-model="visibleAddTag">
                        <el-form :rules="rules" :model="tagForm" ref="tagForm">
                          <el-form-item prop="tag">
                            <el-input v-model="tagForm.tag" placeholder="请输入标签标题"></el-input>
                          </el-form-item>
                        </el-form>
                        <div style="text-align: right; margin: 0;padding-top: 8px;">
                          <el-button size="mini" type="text" @click="handleCancelAddTag">取消</el-button>
                          <el-button type="primary" size="mini" @click="handleAddTag">确定</el-button>
                        </div>
                        <div slot="reference" class="tag-add" title="添加标记">
                          <i class="el-icon-circle-plus"/>
                        </div>
                      </el-popover>
                    </div>
                  </el-form-item>
                  <el-form-item label="创建时间" v-if="!isMultiple">
                    <el-input v-model="metadata.created" disabled suffix-icon="el-icon-date"></el-input>
                  </el-form-item>
                  <el-form-item label="创建者工具">
                    <el-input v-model="metadata.creatorTool"></el-input>
                  </el-form-item>
                  <!--                  <el-form-item label="审核状态">-->
                  <!--                    <el-input v-model="metadata.reviewStatus" disabled suffix-icon="el-icon-arrow-down"></el-input>-->
                  <!--                  </el-form-item>-->
                  <template v-if="type==='PNG'">
                    <el-form-item label="宽度">
                      <el-input v-model="metadata.width" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="高度">
                      <el-input v-model="metadata.height" disabled></el-input>
                    </el-form-item>
                    <!--                    <el-form-item label="位置">-->
                    <!--                      <el-input v-model="metadata.position"></el-input>-->
                    <!--                    </el-form-item>-->
                  </template>
                  <template v-if="type==='MP4'">
                    <el-form-item label="大小">
                      <el-input v-model="metadata.size" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="持续时间（秒）">
                      <el-input v-model="metadata.duration" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="总比特率(kbps)">
                      <el-input v-model="metadata.totalBitRate" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="视频编解码器">
                      <el-input v-model="metadata.videoCodec" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="视频比特率(kbps)">
                      <el-input v-model="metadata.videoBitRate" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="视频帧速率(fps)">
                      <el-input v-model="metadata.videoFrameRate" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="音频编解码器">
                      <el-input v-model="metadata.audioCodec" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="音频比特率(kbps)">
                      <el-input v-model="metadata.audioBitRate" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="音频采样率(hz)">
                      <el-input v-model="metadata.audioSampleRate" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="数字音频通道">
                      <el-input v-model="metadata.numberAudioChannels" disabled></el-input>
                    </el-form-item>
                  </template>
                  <!--                  <template v-if="type==='PDF'">-->
                  <!--                    <el-form-item label="PDF标题">-->
                  <!--                      <el-input v-model="metadata.pdfTitle"></el-input>-->
                  <!--                    </el-form-item>-->
                  <!--                  </template>-->
                </el-form>
              </div>
              <div class="info-list-item">
                <div class="title-item">
                  <h3>计划停用/激活时间</h3>
                </div>
                <el-form label-position="top" :model="metadata">
                  <el-form-item label="开始时间">
                    <el-date-picker
                      style="width: 100%;"
                      v-model="metadata.onTime"
                      type="datetime"
                      :value-format="dateValueFormat"
                    >
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item label="结束时间">
                    <el-date-picker
                      style="width: 100%;"
                      v-model="metadata.offTime"
                      type="datetime"
                      :value-format="dateValueFormat"
                    >
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item label="排序">
                    <el-date-picker
                      style="width: 100%;"
                      v-model="metadata.sort"
                      type="datetime"
                      :value-format="dateValueFormat"
                    >
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item label="下载统计" v-if="!isMultiple">
                    <el-input v-model="metadata.downloadStatistics" disabled></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div class="info-list-item">
                <!--                <div class="title-item">-->
                <!--                  <h3>引用</h3>-->
                <!--                </div>-->
                <div class="title-item" v-show="iptcExtension.downloadManagement">
                  <h3>相关</h3>
                  <div class="download-management" @click="handleJump">
                    <i class="el-icon-paperclip"/>
                    {{ relatedData.name }}
                  </div>
                </div>
                <!--                <div class="title-item">-->
                <!--                  <h3>子资产</h3>-->
                <!--                </div>-->
              </div>
            </div>
            <div v-if="item.key==='senior'" style="display: flex">
              <div class="info-list-item">
                <div class="title-item">
                  <h3>许可</h3>
                </div>
                <el-form label-position="top" :model="senior">
                  <el-form-item label="创建者">
                    <el-input v-model="senior.creator"></el-input>
                  </el-form-item>
                  <el-form-item label="参与者">
                    <el-input v-model="senior.contributor"></el-input>
                  </el-form-item>
                  <el-form-item label="版权">
                    <el-input v-model="senior.copyright"></el-input>
                  </el-form-item>
                  <el-form-item label="版权所有者">
                    <el-input v-model="senior.copyrightOwner"></el-input>
                  </el-form-item>
                  <el-form-item label="使用条款">
                    <el-input v-model="senior.usageTerms"></el-input>
                  </el-form-item>
                  <el-form-item label="版权到期时间">
                    <el-date-picker
                      style="width: 100%;"
                      v-model="senior.expires"
                      type="datetime"
                      :value-format="dateValueFormat"
                    />
                  </el-form-item>
                  <el-form-item label="ID" v-if="!isMultiple">
                    <el-input v-model="senior.ID" disabled></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div class="info-list-item">
                <div class="title-item">
                  <h3>创意评分</h3>
                </div>
                <el-input-number controls-position="right" disabled style="width: 100%;"/>
                <!--                <div class="title-item">-->
                <!--                  <h3 style="color: #323232">评分</h3>-->
                <!--                </div>-->
                <!--                <div>-->
                <!--                  <div class="score-title">您的评分</div>-->
                <!--                  <div>-->
                <!--                    <i v-for="item in score" :key="item"-->
                <!--                       class="el-icon-star-on score-icon rating-icon"-->
                <!--                       @click="handleRating(item)"-->
                <!--                       :style="{color:item<=rating?'rgb(255,215,0)':'rgb(147,147,147)'}"/>-->
                <!--                  </div>-->
                <!--                  <div class="score-title">评分（0 票）</div>-->
                <!--                  <div style="display: flex;align-items: center" v-if="senior.averageRating">-->
                <!--                    <i v-for="item in score" :key="item" class="el-icon-star-on score-icon"-->
                <!--                       :style="{color:item<=senior.averageRating?'rgb(255,215,0)':'rgb(147,147,147)'}"/>-->
                <!--                    <span class="score-title">(1)</span>-->
                <!--                  </div>-->
                <!--                  <div class="score-title">评分细项</div>-->
                <!--                  <div style="display: flex;align-items: center">-->
                <!--                    <i v-for="item in score" :key="item" class="el-icon-star-on score-icon"-->
                <!--                       :style="{color:item<=1?'rgb(255,215,0)':'rgb(147,147,147)'}"/>-->
                <!--                    <span class="score-title">(0)</span>-->
                <!--                  </div>-->
                <!--                  <div style="display: flex;align-items: center">-->
                <!--                    <i v-for="item in score" :key="item" class="el-icon-star-on score-icon"-->
                <!--                       :style="{color:item<=2?'rgb(255,215,0)':'rgb(147,147,147)'}"/>-->
                <!--                    <span class="score-title">(0)</span>-->
                <!--                  </div>-->
                <!--                  <div style="display: flex;align-items: center">-->
                <!--                    <i v-for="item in score" :key="item" class="el-icon-star-on score-icon"-->
                <!--                       :style="{color:item<=3?'rgb(255,215,0)':'rgb(147,147,147)'}"/>-->
                <!--                    <span class="score-title">(0)</span>-->
                <!--                  </div>-->
                <!--                  <div style="display: flex;align-items: center">-->
                <!--                    <i v-for="item in score" :key="item" class="el-icon-star-on score-icon"-->
                <!--                       :style="{color:item<=4?'rgb(255,215,0)':'rgb(147,147,147)'}"/>-->
                <!--                    <span class="score-title">(0)</span>-->
                <!--                  </div>-->
                <!--                  <div style="display: flex;align-items: center">-->
                <!--                    <i v-for="item in score" :key="item" class="el-icon-star-on score-icon"-->
                <!--                       :style="{color:item<=5?'rgb(255,215,0)':'rgb(147,147,147)'}"/>-->
                <!--                    <span class="score-title">(0)</span>-->
                <!--                  </div>-->
                <!--                </div>-->
                <!--              </div>-->
                <!--              <div class="info-list-item">-->
                <!--                <div class="title-item">-->
                <!--                  <h3>提升搜索关键词</h3>-->
                <!--                </div>-->
                <!--                <div>-->
                <!--                  <div class="score-title">搜索提升</div>-->
                <!--                  <div class="search-promotion">-->
                <!--                    <div v-for="(item,index) in searchPromotion" :key="index" class="promotion-item">-->
                <!--                      <el-input v-model="searchPromotion[index]"/>-->
                <!--                      <i class="el-icon-delete-solid promotion-icon" @click="deleteArr('searchPromotion',index)"/>-->
                <!--                    </div>-->
                <!--                    <el-button @click="handleArr('searchPromotion')">添加</el-button>-->
                <!--                  </div>-->
                <!--                </div>-->
              </div>
            </div>
            <div v-if="item.key==='iptc'" style="display: flex">
              <!--              <div class="info-list-item">-->
              <!--                <div class="title-item">-->
              <!--                  <h3>联系方式</h3>-->
              <!--                </div>-->
              <!--                <el-form label-position="top" :model="iptc">-->
              <!--                  <el-form-item label="创建者的职务">-->
              <!--                    <el-input v-model="iptc.jobTitle"></el-input>-->
              <!--                  </el-form-item>-->
              <!--                  <el-form-item label="地址">-->
              <!--                    <el-input v-model="iptc.address"></el-input>-->
              <!--                  </el-form-item>-->
              <!--                  <el-form-item label="城市">-->
              <!--                    <el-input v-model="iptc.contactCity"></el-input>-->
              <!--                  </el-form-item>-->
              <!--                  <el-form-item label="省/自治区/直辖市">-->
              <!--                    <el-input v-model="iptc.contactProvince"></el-input>-->
              <!--                  </el-form-item>-->
              <!--                  <el-form-item label="邮政编码">-->
              <!--                    <el-input v-model="iptc.postalCode"></el-input>-->
              <!--                  </el-form-item>-->
              <!--                  <el-form-item label="国家/地区">-->
              <!--                    <el-input v-model="iptc.contactCountry"></el-input>-->
              <!--                  </el-form-item>-->
              <!--                  <el-form-item label="电话">-->
              <!--                    <el-input v-model="iptc.phone"></el-input>-->
              <!--                  </el-form-item>-->
              <!--                  <el-form-item label="电子邮件">-->
              <!--                    <el-input v-model="iptc.eMail"></el-input>-->
              <!--                  </el-form-item>-->
              <!--                  <el-form-item label="网站">-->
              <!--                    <el-input v-model="iptc.website"></el-input>-->
              <!--                  </el-form-item>-->
              <!--                </el-form>-->
              <!--              </div>-->
              <div class="info-list-item">
                <div class="title-item">
                  <h3>图像</h3>
                </div>
                <el-form label-position="top" :model="iptc">
                  <el-form-item label="创建日期">
                    <el-date-picker
                      style="width: 100%;"
                      v-model="iptc.dateCreated"
                      type="datetime"
                      :value-format="dateValueFormat"
                    >
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item label="知识类型">
                    <el-input v-model="iptc.intellectualGenre"></el-input>
                  </el-form-item>
                  <!--                  <el-form-item label="IPTC场景代码">-->
                  <!--                    <el-input v-model="iptc.sceneCode"></el-input>-->
                  <!--                  </el-form-item>-->
                  <el-form-item label="详细地址">
                    <el-input v-model="iptc.sublocation"></el-input>
                  </el-form-item>
                  <el-form-item label="城市">
                    <el-input v-model="iptc.imageCity"></el-input>
                  </el-form-item>
                  <el-form-item label="省/自治区/直辖市">
                    <el-input v-model="iptc.imageProvince"></el-input>
                  </el-form-item>
                  <el-form-item label="国家/地区">
                    <el-input v-model="iptc.imageCountry"></el-input>
                  </el-form-item>
                  <el-form-item label="ISO国家/地区代码">
                    <el-input v-model="iptc.countryCode"></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div class="info-list-item">
                <div class="title-item">
                  <h3>内容和状态</h3>
                </div>
                <el-form label-position="top" :model="iptc">
                  <el-form-item label="标题">
                    <el-input v-model="iptc.headline"></el-input>
                  </el-form-item>
                  <!--                  <div>-->
                  <!--                    <div class="score-title">关键字</div>-->
                  <!--                    <div class="search-promotion">-->
                  <!--                      <div v-for="(item,index) in keywords" :key="index" class="promotion-item">-->
                  <!--                        <el-input v-model="keywords[index]"/>-->
                  <!--                        <i class="el-icon-delete-solid promotion-icon" @click="deleteArr('keywords',index)"/>-->
                  <!--                      </div>-->
                  <!--                      <el-button @click="handleArr('keywords')">添加</el-button>-->
                  <!--                    </div>-->
                  <!--                  </div>-->
                  <el-form-item label="IPTC主题代码">
                    <el-input v-model="iptc.subjectCode"></el-input>
                  </el-form-item>
                  <el-form-item label="图片描述作者">
                    <el-input v-model="iptc.descriptionWriter"></el-input>
                  </el-form-item>
                  <el-form-item label="职务标识符">
                    <el-input v-model="iptc.jobIdentifier"></el-input>
                  </el-form-item>
                  <el-form-item label="说明">
                    <el-input v-model="iptc.instructions"></el-input>
                  </el-form-item>
                  <el-form-item label="致谢名单">
                    <el-input v-model="iptc.creditLine"></el-input>
                  </el-form-item>
                  <el-form-item label="源">
                    <el-input v-model="iptc.source"></el-input>
                  </el-form-item>
                </el-form>
              </div>
            </div>
            <div v-if="item.key==='iptcExtension'" style="display: flex">
              <div class="info-list-item">
                <div class="title-item">
                  <h3>图像描述</h3>
                </div>
                <!--                <div>-->
                <!--                  <div class="score-title">显示的人员</div>-->
                <!--                  <div class="search-promotion">-->
                <!--                    <div v-for="(item,index) in personShown" :key="index" class="promotion-item">-->
                <!--                      <el-input v-model="keywords[index]"/>-->
                <!--                      <i class="el-icon-delete-solid promotion-icon" @click="deleteArr('personShown',index)"/>-->
                <!--                    </div>-->
                <!--                    <el-button @click="handleArr('personShown')">添加</el-button>-->
                <!--                  </div>-->
                <!--                </div>-->
                <el-form label-position="top" :model="iptcExtension">
                  <el-form-item label="所涉组织的名称">
                    <el-input v-model="iptcExtension.organisationName"></el-input>
                  </el-form-item>
                  <el-form-item label="所涉组织的代码">
                    <el-input v-model="iptcExtension.organisationCode"></el-input>
                  </el-form-item>
                  <el-form-item label="封面图" v-show="metadata.type==='video/mp4'">
                    <div class="cover-image">
                      <el-input class="input" v-model="iptcExtension.coverImage"></el-input>
                      <div class="icon" @click="handleBtn('el-icon-coverImage')"><i class="el-icon-folder-opened"/>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="下载关联" v-if="!isMultiple">
                    <el-input v-model="iptcExtension.downloadManagement" disabled></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div class="info-list-item">
                <div class="title-item">
                  <h3>关于图像中的模特</h3>
                </div>
                <el-form label-position="top" :model="iptcExtension">
                  <el-form-item label="人像有无">
                    <el-select style="width: 100%" v-model="iptcExtension.portrait">
                      <el-option
                        v-for="item in portraitOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="模特的其他信息">
                    <el-input v-model="iptcExtension.additionalModelInfo"></el-input>
                  </el-form-item>
                  <el-form-item label="模特年龄">
                    <el-input v-model="iptcExtension.modelAge"></el-input>
                  </el-form-item>
                  <el-form-item label="小模特图像公开">
                    <el-select style="width: 100%" v-model="iptcExtension.minorModelImageDisclosure">
                      <el-option
                        v-for="(item,index) in minorModelImageDisclosureOptions"
                        :key="index"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="肖像使用授权状态">
                    <el-select style="width: 100%" v-model="iptcExtension.modelReleaseStatus">
                      <el-option
                        v-for="item in releaseOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="肖像使用授权标识符">
                    <el-input v-model="iptcExtension.modelReleaseIdentifier"></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div class="info-list-item">
                <div class="title-item">
                  <h3>管理和权限信息</h3>
                </div>
                <el-form label-position="top" :model="iptcExtension">
                  <el-form-item label="供应商的图像ID">
                    <el-input v-model="iptcExtension.supplierImageID"></el-input>
                  </el-form-item>
                  <el-form-item label="宽度上限">
                    <el-input-number style="width: 100%" v-model="iptcExtension.maxAvailableWidth"
                                     controls-position="right"></el-input-number>
                  </el-form-item>
                  <el-form-item label="高度上限">
                    <el-input-number style="width: 100%" v-model="iptcExtension.maxAvailableHeight"
                                     controls-position="right"></el-input-number>
                  </el-form-item>
                  <el-form-item label="数字源类型">
                    <el-select style="width: 100%" v-model="iptcExtension.digitalSourceType">
                      <el-option
                        v-for="item in digitalSourceTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="资产授权状态">
                    <el-select style="width: 100%" v-model="iptcExtension.propertyReleaseStatus">
                      <el-option
                        v-for="item in propertyReleaseStatusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="资产使用授权标识符">
                    <el-input v-model="iptcExtension.propertyReleaseIdentifier"></el-input>
                  </el-form-item>
                  <el-form-item label="来源">
                    <el-select style="width: 100%" v-model="iptcExtension.source">
                      <el-option
                        v-for="item in sourceOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="授权范围">
                    <el-checkbox-group v-model="iptcExtension.authorizationScope">
                      <el-checkbox v-for="item in authorizationScopeCheckBox" :key="item.value"
                                   :label="item.value">{{ item.label }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-form>
              </div>
            </div>
            <div v-if="item.key==='cameraData'" style="display: flex">
              <div class="info-list-item">
                <div class="title-item">
                  <h3>相机信息测试</h3>
                </div>
                <el-form label-position="top" :model="cameraData">
                  <el-form-item label="设置">
                    <el-input v-model="cameraData.make" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="型号">
                    <el-input v-model="cameraData.model" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="所有者">
                    <el-input v-model="cameraData.owner" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="镜头">
                    <el-input v-model="cameraData.lens" disabled></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div class="info-list-item">
                <div class="title-item">
                  <h3>拍摄信息</h3>
                </div>
                <el-form label-position="top" :model="cameraData">
                  <el-form-item label="焦距（毫米）">
                    <el-input v-model="cameraData.focalLengthInMM" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="焦距（35毫米）">
                    <el-input v-model="cameraData.focalLengthIn35MM" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="曝光时间（秒）">
                    <el-input v-model="cameraData.exposureTime" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="光圈数">
                    <el-input v-model="cameraData.FNumber" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="ISO">
                    <el-input v-model="cameraData.ISO" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="方向">
                    <el-input v-model="cameraData.orientation" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="分辨率（每英寸像素）">
                    <el-input v-model="cameraData.resolution" disabled></el-input>
                  </el-form-item>
                  <el-form-item label="闪光灯">
                    <el-input v-model="cameraData.flash" disabled></el-input>
                  </el-form-item>
                </el-form>
              </div>
            </div>
            <div v-if="item.key==='productData'" style="display: flex">
              <div class="info-list-item">
                <div class="description">此数字资产当前未与任何产品关联。因此，无“产品数据”可提供。</div>
              </div>
            </div>
            <div v-if="item.key==='analyse'" style="display: flex">
              <div class="info-list-item" style="width: 50%">
                <div class="title-item">
                  <h3>分数</h3>
                </div>
                <div>
                  <div class="label">使用情况</div>
                  <div class="value">0</div>
                </div>
                <div class="title-item">
                  <h3>使用情况统计数据</h3>
                </div>
                <div class="table">
                  <div class="header">
                    <span>解决方案</span>
                    <span>计数</span>
                    <span>上次使用日期</span>
                  </div>
                  <div class="table-item">
                    <div><i class="el-icon-data-analysis item-icon"/>资产</div>
                    <div>0</div>
                    <div>未使用</div>
                  </div>
                  <div class="table-item">
                    <div><i class="el-icon-s-platform item-icon"/>Web和移动设备</div>
                    <div>0</div>
                    <div>未使用</div>
                  </div>
                  <div class="table-item">
                    <div><i class="el-icon-share item-icon"/>社交</div>
                    <div>0</div>
                    <div>未使用</div>
                  </div>
                  <div class="table-item">
                    <div><i class="el-icon-message item-icon"/>电子邮件</div>
                    <div>0</div>
                    <div>未使用</div>
                  </div>
                </div>
                <div class="title-item">
                  <h3>性能统计数据</h3>
                </div>
                <div class="label">未配置资产分析。</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div v-else class="folder-content">
      <div class="folder-img">
        <div class="img">
          <img :src="`${baseUrl}${detailData.path}.folderthumbnail.jpg`"/>
          <div class="folder-text">
            <div>文件夹</div>
            <div class="folder-name" v-if="detailData.properties">{{ detailData.properties['jcr:title'] }}</div>
            <div class="folder-name" v-else>{{ name }}</div>
          </div>
        </div>
      </div>
      <div class="folder-tab">
        <el-tabs v-model="selectFolderTab">
          <el-tab-pane v-for="item in folderTabs" :key="item.key" :label="item.label" :name="item.key">
            <div class="folder-tab-content">
              <div class="title">文件夹标题</div>
              <el-input v-model="detailData.title"></el-input>
            </div>
            <div class="folder-tab-content" style="margin-top: 24px">
              <div class="title">排序</div>
              <el-date-picker
                style="width: 100%;"
                v-model="detailData.sort"
                type="datetime"
                :value-format="dateValueFormat"
              >
              </el-date-picker>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <select-dialog :detail-data="detailData" :visible.sync="visible" :path="detailData.path"
                   @finish="init"/>
    <list-dialog :visible.sync="cancelVisible" :file-path="detailData.path" :related-file-path="pathList"
                 :name="nameList" :detail-data="detailData"
                 @finish="init"/>
    <drawer :drawer.sync="showDrawer" :title="drawerTitle" :selectData="[{...detailData}]" :file-name="detailData.name"
            @change="handleMove"/>
    <choose-dialog :visible.sync="visibleCoverImage" :filter-type="fileTypeOptions[0].type" @finish="handleCoverImage"/>
  </el-drawer>
</template>

<script>
import {
  baseUrl,
  portraitOptions,
  minorModelImageDisclosureOptions,
  releaseOptions,
  digitalSourceTypeOptions, sourceOptions, propertyReleaseStatusOptions, authorizationScopeCheckBox, fileTypeOptions
} from '@/utils'
import {
  addTag,
  assetBatchEdit,
  assetDetail,
  assetEdit,
  detailByAssetId,
  editFolder,
  searchPopularTag
} from '@/api/api'
import { dateFormat } from '@/utils/tools'
import SelectDialog from '@/components/SelectDialog/SelectDialog'
import ChooseDialog from '@/components/ChooseDialog/ChooseDialog'
import ListDialog from '@/components/ListDialog/ListDialog'
import drawer from '@/components/Drawer/Drawer'
import { downloadByGet } from '@/api'
import zteStore from '@/store'
import { mapActions } from 'pinia'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export default {
  name: 'InfoDrawer',
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    pathProps: {
      type: String,
      default: ''
    },
    withHeader: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    destroyOnClose: {
      type: Boolean,
      default: true
    },
    direction: {
      type: String,
      default: 'rtl'
    },
    size: {
      type: [String, Number],
      default: '100%'
    }
  },
  components: {
    SelectDialog,
    ListDialog,
    drawer,
    ChooseDialog
  },
  data () {
    const checkTag = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入标签名称'))
      } else if (value.includes('/')) {
        return callback(new Error('请输入正确的标签名称'))
      } else {
        return callback()
      }
    }
    return {
      baseUrl,
      fileTypeOptions,
      portraitOptions,
      minorModelImageDisclosureOptions,
      releaseOptions,
      sourceOptions,
      digitalSourceTypeOptions,
      propertyReleaseStatusOptions,
      authorizationScopeCheckBox,
      score: [1, 2, 3, 4, 5],
      rating: 0,
      dateValueFormat: 'yyyy-MM-dd HH:mm:ss',
      visible: false,
      cancelVisible: false,
      visibleCoverImage: false,
      showDrawer: false,
      drawerTitle: 'move',
      pathList: '',
      nameList: '',
      topBtn: [
        {
          icon: 'el-icon-edit',
          show: false,
          label: '临时编辑'
        }, {
          icon: 'el-icon-edit-outline',
          show: false,
          label: '编辑'
        }, {
          icon: 'el-icon-download',
          show: true,
          label: '下载'
        }, {
          icon: 'el-icon-position',
          show: true,
          label: '移动'
        }, {
          icon: 'el-icon-paperclip',
          show: true,
          label: '相关'
        }, {
          icon: 'el-icon-scissors',
          show: true,
          label: '取消关联'
        }
      ],
      name: '',
      type: '',
      selectTab: 'essential',
      selectFolderTab: 'folder',
      folderTabs: [{
        label: '详细信息',
        key: 'folder'
      }],
      tabs: [{
        label: '基本',
        key: 'essential'
      }, {
        label: '高级',
        key: 'senior'
      }, {
        label: 'IPTC',
        key: 'iptc'
      }, {
        label: 'IPTC扩展',
        key: 'iptcExtension'
      }
        // , {
        //   label: '相机数据',
        //   key: 'cameraData'
        // }, {
        //   label: '产品数据',
        //   key: 'productData'
        // }, {
        //   label: '分析',
        //   key: 'analyse'
        // }
      ],
      tagOptions: [],
      searchPromotion: [],
      keywords: [],
      personShown: [],
      loading: false,
      metadataFormRules: {
        title: [{
          required: true,
          message: '名称不能为空',
          trigger: 'blur'
        }],
        description: [{
          required: true,
          message: '描述不能为空',
          trigger: 'blur'
        }]
      },
      metadata: {
        title: '',
        description: '',
        type: '',
        language: '',
        tags: '',
        created: '',
        creatorTool: '',
        reviewStatus: '',
        width: '',
        height: '',
        position: '',
        size: '',
        duration: '',
        totalBitRate: '',
        videoCodec: '',
        videoBitRate: '',
        videoFrameRate: '',
        audioCodec: '',
        audioBitRate: '',
        audioSampleRate: '',
        numberAudioChannels: '',
        pdfTitle: '',
        onTime: '',
        offTime: '',
        sort: '',
        downloadStatistics: 0
      },
      senior: {
        creator: '',
        contributor: '',
        copyright: '',
        copyrightOwner: '',
        usageTerms: '',
        expires: '',
        ID: '',
        averageRating: 0
      },
      iptc: {
        jobTitle: '',
        address: '',
        contactCity: '',
        contactProvince: '',
        postalCode: '',
        contactCountry: '',
        phone: '',
        eMail: '',
        website: '',
        dateCreated: '',
        intellectualGenre: '',
        sceneCode: '',
        sublocation: '',
        imageCity: '',
        imageProvince: '',
        imageCountry: '',
        countryCode: '',
        headline: '',
        subjectCode: '',
        descriptionWriter: '',
        jobIdentifier: '',
        instructions: '',
        creditLine: '',
        source: ''
      },
      iptcExtension: {
        organisationName: '',
        organisationCode: '',
        coverImage: '',
        downloadManagement: '',
        portrait: '',
        additionalModelInfo: '',
        modelAge: '',
        minorModelImageDisclosure: '',
        modelReleaseStatus: '',
        modelReleaseIdentifier: '',
        supplierImageID: '',
        maxAvailableWidth: undefined,
        maxAvailableHeight: undefined,
        digitalSourceType: '',
        propertyReleaseStatus: '',
        propertyReleaseIdentifier: '',
        source: '',
        authorizationScope: []
      },
      cameraData: {
        make: '',
        model: '',
        owner: '',
        lens: '',
        focalLengthInMM: '',
        focalLengthIn35MM: '',
        exposureTime: '',
        FNumber: '',
        ISO: '',
        orientation: '',
        resolution: '',
        flash: ''
      },
      detailData: {},
      relatedData: {},
      isFolder: false,
      isMultiple: false,
      multipleData: [],
      visibleAddTag: false,
      tagForm: {
        tag: ''
      },
      rules: {
        tag: [{
          validator: checkTag,
          trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    ...mapActions(zteStore, ['getTreeData']),
    async init () {
      this.loading = true
      try {
        let path
        if (this.pathProps) {
          path = this.pathProps
        } else {
          path = this.$route.query.path
        }
        if (path === 'multipleData') {
          this.multipleData = JSON.parse(localStorage.getItem('multipleData'))
          await this.handleTags()
          this.isMultiple = true
          return
        }
        this.name = path.split('/').at(-1)
        this.type = this.name.split('.').at(-1).toUpperCase()
        await this.handleTags()
        const { results } = await assetDetail(encodeURIComponent(path))
        if (results.nodeType !== 'dam:Asset') {
          this.detailData = {
            ...results,
            title: (results.properties && 'jcr:title' in results.properties) ? results.properties['jcr:title'] : this.name,
            sort: (results.metadata && 'dc:sort' in results.metadata) ? new Date(dateFormat(new Date(results.metadata['dc:sort']))) : ''
          }
          this.isFolder = true
          return
        }
        this.detailData = { ...results }
        this.metadata.title = results.metadata['dc:title']
        this.metadata.description = results.metadata['dc:description']
        this.metadata.type = results.metadata['dc:format']
        this.metadata.reviewStatus = '等待'
        'cq:tags' in results.metadata && results.metadata['cq:tags'] && (this.metadata.tags = results.metadata['cq:tags'].split(';'))
        this.metadata.created = dateFormat(new Date(results.metadata['dam:extracted']))
        this.metadata.creatorTool = results.metadata['xmp:CreatorTool']
        this.metadata.height = results.metadata['tiff:ImageLength']
        this.metadata.width = results.metadata['tiff:ImageWidth']
        this.metadata.offTime = results.properties.offTime
        this.metadata.onTime = results.properties.onTime
        this.metadata.sort = results.metadata['dc:sort']
        this.metadata.downloadStatistics = (results.metadata['dc:download'] || '0')
        this.senior.creator = results.metadata['dc:creator']
        this.senior.contributor = results.metadata['dc:contributor']
        this.senior.copyright = results.metadata['dc:rights']
        this.senior.copyrightOwner = results.metadata['xmpRights:Owner']
        this.senior.usageTerms = results.metadata['xmpRights:UsageTerms']
        this.senior.expires = results.metadata['prism:expirationDate']
        this.senior.ID = results.assetId
        this.senior.averageRating = Number(results.properties.averageRating || 0)
        this.rating = Number(results.properties.averageRating || 0)
        this.iptc.dateCreated = dateFormat(new Date(results.metadata['photoshop:DateCreated']))
        this.iptc.intellectualGenre = results.metadata['Iptc4xmpCore:IntellectualGenre']
        this.iptc.sublocation = results.metadata['Iptc4xmpCore:Location']
        this.iptc.imageCity = results.metadata['photoshop:City']
        this.iptc.imageProvince = results.metadata['photoshop:State']
        this.iptc.imageCountry = results.metadata['photoshop:Country']
        this.iptc.countryCode = results.metadata['Iptc4xmpCore:CountryCode']
        this.iptc.headline = results.metadata['photoshop:Headline']
        this.iptc.subjectCode = results.metadata['Iptc4xmpCore:SubjectCode']
        this.iptc.descriptionWriter = results.metadata['photoshop:CaptionWriter']
        this.iptc.jobIdentifier = results.metadata['photoshop:TransmissionReference']
        this.iptc.instructions = results.metadata['photoshop:Instructions']
        this.iptc.creditLine = results.metadata['photoshop:Credit']
        this.iptc.source = results.metadata['photoshop:Source']
        this.iptcExtension.organisationName = results.metadata['Iptc4xmpExt:OrganisationInImageName']
        this.iptcExtension.organisationCode = results.metadata['Iptc4xmpExt:OrganisationInImageCode']
        this.iptcExtension.additionalModelInfo = results.metadata['Iptc4xmpExt:AddlModelInfo']
        this.iptcExtension.modelAge = results.metadata['Iptc4xmpExt:ModelAge']
        this.iptcExtension.minorModelImageDisclosure = results.metadata['plus:MinorModelAgeDisclosure']
        this.iptcExtension.modelReleaseStatus = results.metadata['plus:ModelReleaseStatus']
        this.iptcExtension.modelReleaseIdentifier = results.metadata['plus:ModelReleaseID']
        this.iptcExtension.supplierImageID = results.metadata['plus:ImageSupplierImageID']
        this.iptcExtension.maxAvailableWidth = (results.metadata['Iptc4xmpExt:MaxAvailWidth'] === '' ? undefined : results.metadata['Iptc4xmpExt:MaxAvailWidth'])
        this.iptcExtension.maxAvailableHeight = (results.metadata['Iptc4xmpExt:MaxAvailHeight'] === '' ? undefined : results.metadata['Iptc4xmpExt:MaxAvailHeight'])
        this.iptcExtension.digitalSourceType = results.metadata['Iptc4xmpExt:DigitalSourceType']
        this.iptcExtension.propertyReleaseIdentifier = results.metadata['plus:PropertyReleaseID']
        this.iptcExtension.coverImage = results.metadata['dc:coverImage']
        this.iptcExtension.portrait = results.metadata['dc:portrait']
        this.iptcExtension.source = results.metadata['dc:source']
        this.iptcExtension.propertyReleaseStatus = results.metadata['dc:propertyReleaseStatus']
        'dc:authorizationScope' in results.metadata && (this.iptcExtension.authorizationScope = results.metadata['dc:authorizationScope'].split(';'))
        // const res = await checkRelated(encodeURIComponent(path))
        // const flag = res[path] ?? {}
        // if (Object.keys(flag).length) {
        //   const { sources } = res[path]
        //   const length = Object.keys(sources).length
        //   this.topBtn = [...this.topBtn.map(e => ({
        //     ...e,
        //     show: e.icon === 'el-icon-scissors' ? !!length : e.show
        //   }))]
        //   this.relatedData = length ? sources : {}
        //   length && (this.iptcExtension.downloadManagement = decodeURIComponent(Object.keys(sources)[0]))
        // } else {
        //   this.topBtn = [...this.topBtn.map(e => ({
        //     ...e,
        //     show: e.icon === 'el-icon-scissors' ? false : e.show
        //   }))]
        //   this.relatedData = {}
        // }
        if (results.metadata['dc:downloadManagement']) {
          const res = await detailByAssetId(results.metadata['dc:downloadManagement'])
          this.relatedData = { ...res.results }
        }
        this.iptcExtension.downloadManagement = results.metadata['dc:downloadManagement']
        this.topBtn = [...this.topBtn.map(e => ({
          ...e,
          show: e.icon === 'el-icon-scissors' ? !!('dc:downloadManagement' in results.metadata && results.metadata['dc:downloadManagement']) : e.show
        }))]
      } finally {
        this.loading = false
      }
    },
    async closeDrawer (type) {
      if (type === 'save' || type === 'saveAndClose') {
        await this.handleFormData()
        if (type === 'save' && this.isFolder) {
          await this.init()
        }
        if (type === 'saveAndClose') {
          if (this.$refs.metadataForm.length) {
            this.$refs.metadataForm[0].validate(async valid => {
              if (valid) {
                if (this.pathProps) {
                  this.$emit('update:drawer', false)
                } else {
                  const { path } = this.$route
                  await this.$router.push({ path })
                }
              }
            })
          } else {
            if (this.pathProps) {
              this.$emit('update:drawer', false)
            } else {
              const { path } = this.$route
              await this.$router.push({ path })
            }
          }
        }
      } else {
        if (this.pathProps) {
          this.$emit('update:drawer', false)
        } else {
          const { path } = this.$route
          await this.$router.push({ path })
        }
      }
    },
    handleBtn (icon) {
      icon === 'el-icon-paperclip' && (this.visible = true)
      icon === 'el-icon-scissors' && this.handleRelate()
      icon === 'el-icon-position' && (this.showDrawer = true)
      icon === 'el-icon-download' && this.handleDownload()
      icon === 'el-icon-coverImage' && (this.visibleCoverImage = true)
    },
    handleDownload () {
      downloadByGet(`${this.detailData.path}`, this.detailData.name)
      this.metadata.downloadStatistics = Number(this.metadata.downloadStatistics) + 1
    },
    handleMove (data) {
      this.showDrawer = false
      const { path } = this.$route
      this.$router.push({
        path,
        query: {
          path: `${data.path}/${data.name}`
        }
      })
    },
    async handleRelate () {
      // const text = this.detailData.metadata['dc:downloadManagement']
      // const { results: { name } } = await assetDetail(encodeURIComponent(text))
      // const name = Object.keys(this.relatedData)[0]
      // const text = this.relatedData[name]
      this.nameList = this.relatedData.name
      this.pathList = this.relatedData.path
      // this.pathList = text
      this.visibleList = true
      this.cancelVisible = true
    },
    async handleFormData () {
      this.loading = true
      if (this.isFolder) {
        const {
          path,
          title,
          sort
        } = this.detailData
        const formData = new FormData()
        formData.append('./jcr:content/jcr:title', title)
        formData.append('./jcr:content/dc:sort', sort ? dayjs(sort).format() : '')
        // formData.append('title', title)
        // formData.append('./jcr:primaryType', nodeType)
        // formData.append('_charset_', 'UTF-8')
        // formData.append(':operation', 'dam.share.folder')
        // formData.append('path', path)
        const res = await editFolder(path, formData)
        if (res['status.code'] === 200) {
          this.$message.success('成功 已成功提交表单')
          await this.getTreeData()
        } else {
          this.$message.error(`失败 ${res['status.message']}`)
        }
        return
      }
      if (this.isMultiple) {
        const properties = {}
        properties.onTime = this.metadata.onTime
        properties.onTime = this.metadata.onTime
        const metadata = {}
        metadata['dc:title'] = this.metadata.title
        metadata['dc:description'] = this.metadata.description
        metadata['cq:tags'] = this.metadata.tags.join(';')
        metadata['xmp:CreatorTool'] = this.metadata.creatorTool
        metadata['dc:sort'] = this.metadata.sort
        metadata['dc:creator'] = this.senior.creator
        metadata['dc:contributor'] = this.senior.contributor
        metadata['dc:rights'] = this.senior.copyright
        metadata['xmpRights:Owner'] = this.senior.copyrightOwner
        metadata['xmpRights:UsageTerms'] = this.senior.usageTerms
        metadata['prism:expirationDate'] = this.senior.expires
        metadata['photoshop:DateCreated'] = this.iptc.dateCreated
        metadata['Iptc4xmpCore:IntellectualGenre'] = this.iptc.intellectualGenre
        metadata['Iptc4xmpCore:Location'] = this.iptc.sublocation
        metadata['photoshop:City'] = this.iptc.imageCity
        metadata['photoshop:State'] = this.iptc.imageProvince
        metadata['photoshop:Country'] = this.iptc.imageCountry
        metadata['Iptc4xmpCore:CountryCode'] = this.iptc.countryCode
        metadata['photoshop:Headline'] = this.iptc.headline
        metadata['Iptc4xmpCore:SubjectCode'] = this.iptc.subjectCode
        metadata['photoshop:CaptionWriter'] = this.iptc.descriptionWriter
        metadata['photoshop:TransmissionReference'] = this.iptc.jobIdentifier
        metadata['photoshop:Instructions'] = this.iptc.instructions
        metadata['photoshop:Credit'] = this.iptc.creditLine
        metadata['photoshop:Source'] = this.iptc.source
        metadata['Iptc4xmpExt:OrganisationInImageName'] = this.iptcExtension.organisationName
        metadata['Iptc4xmpExt:OrganisationInImageCode'] = this.iptcExtension.organisationCode
        metadata['dc:portrait'] = this.iptcExtension.portrait
        metadata['Iptc4xmpExt:AddlModelInfo'] = this.iptcExtension.additionalModelInfo
        metadata['Iptc4xmpExt:ModelAge'] = this.iptcExtension.modelAge
        metadata['plus:MinorModelAgeDisclosure'] = this.iptcExtension.minorModelImageDisclosure
        metadata['plus:ModelReleaseStatus'] = this.iptcExtension.modelReleaseStatus
        metadata['plus:ModelReleaseID'] = this.iptcExtension.modelReleaseIdentifier
        metadata['plus:ImageSupplierImageID'] = this.iptcExtension.supplierImageID
        metadata['Iptc4xmpExt:MaxAvailWidth'] = this.iptcExtension.maxAvailableWidth || ''
        metadata['Iptc4xmpExt:MaxAvailHeight'] = this.iptcExtension.maxAvailableHeight || ''
        metadata['Iptc4xmpExt:DigitalSourceType'] = this.iptcExtension.digitalSourceType
        metadata['plus:PropertyReleaseID'] = this.iptcExtension.propertyReleaseIdentifier
        metadata['dc:source'] = this.iptcExtension.source
        metadata['dc:propertyReleaseStatus'] = this.iptcExtension.propertyReleaseStatus
        metadata['dc:authorizationScope'] = this.iptcExtension.authorizationScope.join(';')
        for (const key in metadata) {
          !metadata[key] && delete metadata[key]
        }
        for (const key in properties) {
          !properties[key] && delete properties[key]
        }
        this.$refs.metadataForm[0].validate(async valid => {
          if (valid) {
            try {
              const {
                status,
                success,
                errorMessage
              } = await assetBatchEdit({
                paths: this.multipleData.map(e => e.path),
                properties,
                metadata
              })
              if (status === 200 && success) {
                this.$message.success('成功 已成功提交表单')
              } else {
                this.$message.error(`失败 ${errorMessage}`)
              }
            } finally {
              this.loading = false
            }
          } else {
            this.loading = false
          }
        })
        return
      }
      this.detailData.metadata['dc:title'] = this.metadata.title
      this.detailData.metadata['dc:description'] = this.metadata.description
      this.detailData.metadata['cq:tags'] = this.metadata.tags.join(';')
      this.detailData.metadata['xmp:CreatorTool'] = this.metadata.creatorTool
      this.detailData.properties.onTime = this.metadata.onTime
      this.detailData.properties.offTime = this.metadata.offTime
      this.detailData.metadata['dc:sort'] = this.metadata.sort
      this.detailData.metadata['dc:creator'] = this.senior.creator
      this.detailData.metadata['dc:contributor'] = this.senior.contributor
      this.detailData.metadata['dc:rights'] = this.senior.copyright
      this.detailData.metadata['xmpRights:Owner'] = this.senior.copyrightOwner
      this.detailData.metadata['xmpRights:UsageTerms'] = this.senior.usageTerms
      this.detailData.metadata['prism:expirationDate'] = this.senior.expires
      this.detailData.metadata['photoshop:DateCreated'] = this.iptc.dateCreated
      this.detailData.metadata['Iptc4xmpCore:IntellectualGenre'] = this.iptc.intellectualGenre
      this.detailData.metadata['photoshop:City'] = this.iptc.imageCity
      this.detailData.metadata['photoshop:State'] = this.iptc.imageProvince
      this.detailData.metadata['photoshop:Country'] = this.iptc.imageCountry
      this.detailData.metadata['Iptc4xmpCore:CountryCode'] = this.iptc.countryCode
      this.detailData.metadata['photoshop:Headline'] = this.iptc.headline
      this.detailData.metadata['Iptc4xmpCore:SubjectCode'] = this.iptc.subjectCode
      this.detailData.metadata['photoshop:CaptionWriter'] = this.iptc.descriptionWriter
      this.detailData.metadata['photoshop:TransmissionReference'] = this.iptc.jobIdentifier
      this.detailData.metadata['photoshop:Instructions'] = this.iptc.instructions
      this.detailData.metadata['photoshop:Credit'] = this.iptc.creditLine
      this.detailData.metadata['photoshop:Source'] = this.iptc.source
      this.detailData.metadata['Iptc4xmpCore:Location'] = this.iptc.sublocation
      this.detailData.metadata['Iptc4xmpExt:OrganisationInImageName'] = this.iptcExtension.organisationName
      this.detailData.metadata['Iptc4xmpExt:OrganisationInImageCode'] = this.iptcExtension.organisationCode
      this.detailData.metadata['dc:coverImage'] = this.iptcExtension.coverImage
      this.detailData.metadata['dc:portrait'] = this.iptcExtension.portrait
      this.detailData.metadata['Iptc4xmpExt:AddlModelInfo'] = this.iptcExtension.additionalModelInfo
      this.detailData.metadata['Iptc4xmpExt:ModelAge'] = this.iptcExtension.modelAge
      this.detailData.metadata['plus:MinorModelAgeDisclosure'] = this.iptcExtension.minorModelImageDisclosure
      this.detailData.metadata['plus:ModelReleaseStatus'] = this.iptcExtension.modelReleaseStatus
      this.detailData.metadata['plus:ModelReleaseID'] = this.iptcExtension.modelReleaseIdentifier
      this.detailData.metadata['plus:ImageSupplierImageID'] = this.iptcExtension.supplierImageID
      this.detailData.metadata['Iptc4xmpExt:MaxAvailWidth'] = this.iptcExtension.maxAvailableWidth || ''
      this.detailData.metadata['Iptc4xmpExt:MaxAvailHeight'] = this.iptcExtension.maxAvailableHeight || ''
      this.detailData.metadata['Iptc4xmpExt:DigitalSourceType'] = this.iptcExtension.digitalSourceType
      this.detailData.metadata['plus:PropertyReleaseID'] = this.iptcExtension.propertyReleaseIdentifier
      this.detailData.metadata['dc:source'] = this.iptcExtension.source
      this.detailData.metadata['dc:propertyReleaseStatus'] = this.iptcExtension.propertyReleaseStatus
      this.detailData.metadata['dc:authorizationScope'] = this.iptcExtension.authorizationScope.join(';')
      this.detailData.metadata['dc:download'] = this.metadata.downloadStatistics
      this.$refs.metadataForm[0].validate(async valid => {
        if (valid) {
          try {
            const {
              status,
              success,
              errorMessage
            } = await assetEdit({ ...this.detailData })
            if (status === 200 && success) {
              this.$message.success('成功 已成功提交表单')
            } else {
              this.$message.error(`失败 ${errorMessage}`)
            }
          } finally {
            this.loading = false
          }
        } else {
          this.loading = false
        }
      })
    },
    async handleTags () {
      const { results } = await searchPopularTag('/content/cq:tags/zte-asset-tags')
      const flag = Object.keys(results)
      this.tagOptions = flag.map(e => ({
        label: results[e],
        value: e
      }))
    },
    handleSelectTag (flag) {
      flag && this.handleTags()
    },
    handleRating (num) {
      this.rating = num
    },
    handleArr (key) {
      this[key] = [...this[key], '']
    },
    deleteArr (key, index) {
      this[key] = [...this[key].filter((_, idx) => idx !== index)]
    },
    handleJump () {
      const { path } = this.$route
      this.$router.push({
        path,
        query: {
          path: this.relatedData.path
        }
      })
    },
    handleCoverImage (path) {
      this.iptcExtension.coverImage = path
    },
    handleCancelAddTag () {
      this.visibleAddTag = false
      this.tagForm.tag = ''
    },
    handleAddTag () {
      const formData = new FormData()
      formData.append('./jcr:title', this.tagForm.tag)
      formData.append('_charset_', 'UTF-8')
      this.$refs.tagForm[0].validate(async valid => {
        if (valid) {
          const res = await addTag(`/content/cq:tags/zte-asset-tags/${this.tagForm.tag}`, formData)
          if (res['status.code'] === 200 || res['status.code'] === 201) {
            this.$message.success('添加标签成功')
            await this.handleTags()
            this.handleCancelAddTag()
          } else {
            this.$message.error(`失败 ${res['status.message']}`)
          }
        }
      })
    }
  },
  mounted () {
    this.drawer && this.init()
  }
}
</script>

<style lang="scss" scoped>
.drawer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4375rem 1rem;
  border-bottom: 0.0625rem solid #E1E1E1;
  height: 3.25rem;
  background-color: rgb(250, 250, 250);

  .top-btn {
    display: flex;
  }

  .btn {
    padding: .625rem;
    font-weight: 700;
    font-style: normal;
    color: #6d6d6d;
    border-color: #d0d0d0;
    background-color: #fafafa;
    margin-right: 1rem;
    box-sizing: border-box;
    font-size: .9375rem;
    text-align: center;
    cursor: pointer;
    white-space: nowrap;

    i {
      margin-right: 4px;
      font-size: 18px;
    }
  }

  .btn:hover {
    background-color: transparent;
    color: #323232;
    text-decoration: none;
  }
}

.info-item {
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 0.0625rem solid #E1E1E1;
  height: 3rem;
  background-color: #F0F0F0;
  position: relative;

  .info-title {
    order: 2;
    flex: 0 1 auto; /* Allow the title area to shrink */
    overflow: hidden;
    color: rgb(109, 109, 109);
    font-size: 1.125rem;
    font-weight: bold;
  }

  .info-last {
    position: absolute;
    right: 1rem;
    color: rgb(109, 109, 109);

    i {
      cursor: pointer;
      font-size: 18px;
    }

    i:hover {
      color: #323232;
    }
  }
}

.info-content {
  height: calc(100vh - 3.25rem - 3rem);
  display: flex;
  background-color: rgb(245, 245, 245);

  .left-info {
    text-align: center;
    width: 29%;
    overflow: auto;
    padding: 0.9375rem;

    /deep/ .el-image {
      overflow: unset;
    }

    .left-name {
      display: block;
      padding: .9375rem;
      border-top: .0625rem solid #e6e6e6;
      box-sizing: border-box;
      color: #323232;
      font-size: .8125rem;
      font-weight: 700;
      background-color: #FFFFFF;
    }
  }

  .right-tab {
    flex: 1;
    margin-left: 2rem;
    padding: .9375rem;
    overflow: auto;

    .info-list-item {
      width: 25%;
      margin-right: 5%;

      .tag-add {
        margin-left: 12px;
        cursor: pointer;

        i {
          font-size: 20px;
          color: rgb(25, 137, 250);
        }
      }

      .cover-image {
        display: flex;

        .input {
          flex: 1;
        }

        .icon {
          height: 2.375rem;
          width: 2.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 0 .25rem .25rem 0;
          border: .0625rem solid #d0d0d0;
          background-color: #fafafa;

          i {
            font-size: 20px;
            color: rgb(109, 109, 109);
          }
        }
      }

      .description {
        margin-top: 1.5625rem;
        font-size: .8125rem;
        line-height: 1.0625rem;
        color: #323232;
      }

      .title-item {
        font-size: .8125rem;
        color: #6d6d6d;
        line-height: 1.6875rem;

        .download-management {
          cursor: pointer;

          i {
            margin-right: 12px;
          }
        }

        .download-management:hover {
          color: #323232;
        }
      }

      .label {
        line-height: 1.6875rem;
        color: #6d6d6d;
        font-size: .8125rem;
      }

      .value {
        line-height: 1.0625rem;
        color: #323232;
        margin: 0 0 .375rem;
        font-size: 18px;
        font-weight: bold;
      }

      .table {
        width: 100%;
        font-size: .8125rem;

        .header {
          display: flex;
          padding: 0 .625rem;
          margin-bottom: 1rem;

          span {
            line-height: 1.0625rem;
            font-weight: bold;
            flex: 1;
          }

          span:nth-child(2) {
            text-align: center;
          }

          span:nth-child(3) {
            text-align: right;
          }
        }

        .table-item {
          display: flex;
          background-color: #FFFFFF;
          color: #323232;
          align-items: center;

          div {
            flex: 1;
            padding: .8rem .625rem;
            border-top: .0625rem solid #e9e9e9;
          }

          .item-icon {
            font-size: 18px;
            margin-right: 1rem;
          }

          div:nth-child(1) {
            display: flex;
          }

          div:nth-child(2) {
            text-align: center;
          }

          div:nth-child(3) {
            text-align: right;
          }
        }
      }

      .score-title {
        color: #6d6d6d;
        display: block;
        line-height: 1.6875rem;
        font-size: .8125rem;
      }

      .score-icon {
        margin-right: .25rem;
      }

      .rating-icon {
        font-size: 30px;
        cursor: pointer;
      }

      .search-promotion {
        background: #f0f0f0;
        border: .0625rem solid #e9e9e9;
        box-sizing: border-box;
        padding: .625rem;
        margin: 0 0 .375rem;

        .promotion-item {
          margin-bottom: .625rem;
          display: flex;
          align-items: center;

          .promotion-icon {
            cursor: pointer;
            color: #6d6d6d;
            padding: .375rem;
            font-size: 18px;
          }
        }
      }
    }
  }

  .multiple-list {
    display: flex;
    align-items: center;
    border-left: .0625rem solid #e6e6e6;
    border-right: .0625rem solid #e6e6e6;
    border-bottom: .0625rem solid #e6e6e6;

    /deep/ .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .image {
      width: 3rem;
      height: 3rem;
    }

    .name {
      flex: 1;
      background-color: #FFFFFF;
      text-align: left;
      line-height: 3rem;
      padding: 0 .625rem;
      height: 3rem;
      font-weight: normal;
      font-style: normal;
      font-size: .8125rem;
      color: #323232;
    }
  }
}

.folder-content {
  height: calc(100vh - 3.25rem - 3rem);
  display: flex;
  justify-content: center;
  background-color: rgb(245, 245, 245);
  padding-top: 1rem;

  .folder-img {
    box-sizing: border-box;
    margin: 0 .5rem;
    width: 30rem;
    background-color: #FFF;
    box-shadow: 0 0.09375rem 0.09375rem rgba(0, 0, 0, 0.25);
    padding: 1rem;
    height: 16rem;

    .img {
      margin: 0 auto;
      width: 20rem;
      height: 100%;
      display: flex;
      background-color: rgb(233, 233, 233);
      border-radius: 4px;
      position: relative;

      img {
        margin: 0 auto;
        width: auto;
        min-height: 1px;
        max-width: 100%;
        opacity: 1;
        -ms-filter: none;
        filter: none;
        -webkit-transition: opacity 1s;
        -moz-transition: opacity 1s;
        -o-transition: opacity 1s;
        -ms-transition: opacity 1s;
        transition: opacity 1s;
        object-fit: cover;
      }

      .folder-text {
        position: absolute;
        top: 0;
        height: 9.375rem;
        width: 100%;
        border-top-left-radius: .1875rem;
        border-top-right-radius: .1875rem;
        background-color: rgba(30, 30, 30, 0.9);
        color: #bebebe;
        box-sizing: border-box;
        padding-left: .9375rem;
        padding-bottom: .9375rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        font-size: .75rem;

        .folder-name {
          font-weight: 700;
          font-style: normal;
          color: #FFFFFF;
          margin-top: .125rem;
        }
      }
    }
  }

  .folder-tab {
    width: 46rem;
    margin: 0 .5rem;

    .folder-tab-content {
      margin-top: 8px;
      margin-left: 10px;

      .title {
        font-size: 1.125rem;
        line-height: 1.25rem;
        font-weight: 700;
        font-style: normal;
        color: #323232;
        margin-bottom: 1rem;
      }
    }
  }
}

/deep/ .el-form-item__label {
  padding: 0;
  line-height: 30px;
}

/deep/ .el-form-item {
  margin-bottom: 12px;
}
</style>
