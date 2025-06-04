#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
词书格式转换脚本
将JSON格式的词书转换为我们数据库的SQL格式
"""

import json
import re
from typing import List, Dict, Any

def clean_text(text: str) -> str:
    """清理文本，移除多余的空格和特殊字符"""
    if not text:
        return ""
    # 移除多余的空格和换行符
    text = re.sub(r'\s+', ' ', text.strip())
    # 转义SQL中的单引号
    text = text.replace("'", "''")
    return text

def extract_pronunciation(word_data: Dict) -> Dict[str, str]:
    """提取发音信息"""
    pronunciation = {}
    
    # 提取美式发音
    if 'usphone' in word_data:
        us_phone = word_data['usphone']
        if us_phone and us_phone.strip():
            # 清理发音符号，如果已经有斜杠就不重复添加
            us_clean = us_phone.strip()
            if not us_clean.startswith('/'):
                us_clean = f"/{us_clean}/"
            pronunciation['us'] = us_clean
    
    # 提取英式发音
    if 'ukphone' in word_data:
        uk_phone = word_data['ukphone'] 
        if uk_phone and uk_phone.strip():
            # 清理发音符号，如果已经有斜杠就不重复添加
            uk_clean = uk_phone.strip()
            if not uk_clean.startswith('/'):
                uk_clean = f"/{uk_clean}/"
            pronunciation['uk'] = uk_clean
    
    return pronunciation

def extract_meanings(word_data: Dict) -> List[Dict]:
    """提取词义信息"""
    meanings = []
    
    if 'trans' in word_data:
        for trans_item in word_data['trans']:
            meaning = {
                'partOfSpeech': trans_item.get('pos', '').strip(),
                'definition': clean_text(trans_item.get('tranCn', '')),
                'examples': []
            }
            meanings.append(meaning)
    
    # 提取例句
    examples = []
    if 'sentence' in word_data and 'sentences' in word_data['sentence']:
        for sentence_item in word_data['sentence']['sentences'][:3]:  # 最多取3个例句
            if 'sContent' in sentence_item and 'sCn' in sentence_item:
                example = {
                    'sentence': clean_text(sentence_item['sContent']),
                    'translation': clean_text(sentence_item['sCn'])
                }
                examples.append(example)
    
    # 将例句分配给第一个词义，如果没有词义则创建一个
    if not meanings and examples:
        meanings.append({
            'partOfSpeech': '',
            'definition': '',
            'examples': examples
        })
    elif meanings and examples:
        meanings[0]['examples'] = examples
    
    return meanings

def convert_word_to_sql(word_data: Dict, book_name: str, word_order: int) -> str:
    """将单个词汇转换为SQL插入语句"""
    
    # 提取基本信息
    word = clean_text(word_data.get('headWord', ''))
    if not word:
        print(f"警告: 第{word_order}个词汇没有headWord")
        return ""
    
    print(f"处理词汇: {word}")
    
    # 提取内容 - 修正路径
    content = word_data.get('content', {}).get('word', {}).get('content', {})
    if not content:
        print(f"警告: 词汇 {word} 没有content数据")
        return ""
    
    # 提取发音
    pronunciation = extract_pronunciation(content)
    print(f"  发音: {pronunciation}")
    
    # 提取词义
    meanings = extract_meanings(content)
    print(f"  词义数量: {len(meanings)}")
    
    if not meanings:
        print(f"警告: 词汇 {word} 没有找到词义")
        return ""
    
    # 构建JSON内容
    json_content = {
        'pronunciation': pronunciation,
        'meanings': meanings
    }
    
    # 转换为SQL格式的JSON字符串，不要再次转义单引号
    json_str = json.dumps(json_content, ensure_ascii=False, indent=2)
    # 只转义SQL字符串中的单引号
    json_str = json_str.replace("'", "''")
    
    # 生成SQL语句
    sql = f"""((SELECT id FROM vocabulary_books WHERE name = '{book_name}'), '{word}', '{json_str}', {word_order})"""
    
    return sql

def create_full_json_sample():
    """创建包含用户提供的完整示例数据的JSON文件"""
    sample_data = [
        {
            "wordRank": 1,
            "headWord": "access",
            "content": {
                "word": {
                    "wordHead": "access",
                    "wordId": "CET4luan_1_1",
                    "content": {
                        "sentence": {
                            "sentences": [
                                {"sContent": "Users can access their voice mail remotely.", "sCn": "用户可以远程获取语音邮件。"},
                                {"sContent": "Access to the papers is restricted to senior management.", "sCn": "只有高级管理层才有权查阅这些文件。"}
                            ]
                        },
                        "usphone": "'æksɛs",
                        "ukphone": "'ækses",
                        "trans": [
                            {"tranCn": "获取", "pos": "v"},
                            {"tranCn": "接近，入口", "pos": "n"}
                        ]
                    }
                }
            }
        },
        {
            "wordRank": 2,
            "headWord": "project",
            "content": {
                "word": {
                    "wordHead": "project",
                    "wordId": "CET4luan_1_2",
                    "content": {
                        "sentence": {
                            "sentences": [
                                {"sContent": "The project aims to provide an analysis of children's emotions.", "sCn": "该计划旨在对儿童情绪作出分析。"},
                                {"sContent": "a three-year research project", "sCn": "一项为期三年的研究计划"}
                            ]
                        },
                        "usphone": "prəˈdʒɛkt",
                        "ukphone": "prəˈdʒekt",
                        "trans": [
                            {"tranCn": "工程；课题、作业", "pos": "n"}
                        ]
                    }
                }
            }
        },
        {
            "wordRank": 3,
            "headWord": "intention",
            "content": {
                "word": {
                    "wordHead": "intention",
                    "wordId": "CET4luan_1_3",
                    "content": {
                        "sentence": {
                            "sentences": [
                                {"sContent": "They went into town with the intention of visiting the library.", "sCn": "他们进了城，打算参观图书馆。"}
                            ]
                        },
                        "usphone": "ɪn'tɛnʃən",
                        "ukphone": "ɪnˈtenʃn",
                        "trans": [
                            {"tranCn": "打算，意图", "pos": "n"}
                        ]
                    }
                }
            }
        },
        {
            "wordRank": 4,
            "headWord": "negotiate",
            "content": {
                "word": {
                    "wordHead": "negotiate",
                    "wordId": "CET4luan_1_5",
                    "content": {
                        "sentence": {
                            "sentences": [
                                {"sContent": "His first aim is to get the warring parties back to the negotiating table.", "sCn": "他的首要目标就是把交战各方拉回到谈判桌上。"}
                            ]
                        },
                        "usphone": "nɪ'ɡoʃɪet",
                        "ukphone": "nɪ'ɡəʊʃɪeɪt",
                        "trans": [
                            {"tranCn": "谈判，协商，交涉", "pos": "v"}
                        ]
                    }
                }
            }
        },
        {
            "wordRank": 5,
            "headWord": "alternative",
            "content": {
                "word": {
                    "wordHead": "alternative",
                    "wordId": "CET4luan_1_7",
                    "content": {
                        "sentence": {
                            "sentences": [
                                {"sContent": "New ways to treat arthritis may provide an alternative to painkillers.", "sCn": "治疗关节炎的新方法可能会提供一种止痛药的替代品。"}
                            ]
                        },
                        "usphone": "ɔl'tɝnətɪv",
                        "ukphone": "ɔ:lˈtɜ:nətɪv",
                        "trans": [
                            {"tranCn": "代替品", "pos": "n"}
                        ]
                    }
                }
            }
        }
    ]
    
    # 写入JSON文件，每行一个对象
    with open('CET4_sample_full.json', 'w', encoding='utf-8') as f:
        for item in sample_data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')
    
    print("已创建完整的示例JSON文件: CET4_sample_full.json")

def convert_json_to_sql(input_file: str, output_file: str, book_name: str, book_description: str):
    """转换JSON文件到SQL文件"""
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        print(f"文件内容长度: {len(content)}")
        
        # 按行分割JSON对象
        lines = content.split('\n')
        words_data = []
        
        for i, line in enumerate(lines, 1):
            if line.strip():
                try:
                    word_data = json.loads(line)
                    words_data.append(word_data)
                    print(f"成功解析第{i}行JSON")
                except json.JSONDecodeError as e:
                    print(f"跳过无效的JSON行{i}: {e}")
                    print(f"内容: {line[:100]}...")
                    continue
        
        print(f"成功解析 {len(words_data)} 个词汇")
        
        if not words_data:
            print("错误: 没有找到有效的词汇数据")
            return
        
        # 根据词书名称确定标签
        if 'CET-4' in book_name or 'CET4' in book_name:
            tags = "ARRAY['CET4', '大学英语', '考试']"
            difficulty = 'intermediate'
        elif 'CET-6' in book_name or 'CET6' in book_name:
            tags = "ARRAY['CET6', '大学英语', '考试']"
            difficulty = 'advanced'
        else:
            tags = "ARRAY['词汇', '学习']"
            difficulty = 'intermediate'
        
        # 生成SQL文件
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("-- Auto-generated vocabulary SQL from JSON\n\n")
            
            # 创建词书
            f.write(f"-- Insert vocabulary book\n")
            f.write(f"INSERT INTO vocabulary_books (name, description, difficulty, tags) VALUES\n")
            f.write(f"('{book_name}', '{book_description}', '{difficulty}', {tags})\n")
            f.write(f"ON CONFLICT DO NOTHING;\n\n")
            
            # 插入词汇
            f.write(f"-- Insert vocabulary words\n")
            f.write(f"INSERT INTO vocabulary_words (book_id, word, content, word_order) VALUES\n")
            
            sql_values = []
            for i, word_data in enumerate(words_data, 1):  # 处理所有词汇
                sql_value = convert_word_to_sql(word_data, book_name, i)
                if sql_value:
                    sql_values.append(sql_value)
            
            if sql_values:
                # 写入SQL值
                f.write(",\n".join(sql_values))
                f.write(";\n\n")
            else:
                f.write("-- No valid words found;\n\n")
            
            # 更新词书总数
            f.write("-- Update total_words count\n")
            f.write("UPDATE vocabulary_books \n")
            f.write("SET total_words = (\n")
            f.write("  SELECT COUNT(*) \n")
            f.write("  FROM vocabulary_words \n")
            f.write("  WHERE vocabulary_words.book_id = vocabulary_books.id\n")
            f.write(");\n")
        
        print(f"转换完成！生成了 {len(sql_values)} 个词汇的SQL文件: {output_file}")
        
    except FileNotFoundError:
        print(f"错误: 找不到输入文件 {input_file}")
    except Exception as e:
        print(f"转换过程中出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # 首先创建完整的示例JSON文件
    create_full_json_sample()
    
    # 配置参数
    input_file = "IELTSluan_2.json"  # 输入的JSON文件
    output_file = "010_add_ielts_vocabulary.sql"  # 输出的SQL文件
    book_name = "IELTS Basic"  # 词书名称
    book_description = "雅思基础词汇，涵盖雅思考试必备单词，适合出国留学的英语水平证明。"  # 词书描述
    
    convert_json_to_sql(input_file, output_file, book_name, book_description) 