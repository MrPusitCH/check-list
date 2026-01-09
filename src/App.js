import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { checklistData } from './checklistData';
import './App.css';

function App() {
  const [checkedItems, setCheckedItems] = useState({});
  const exportRef = useRef(null);

  const handleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCheckAll = () => {
    const allItems = {};
    checklistData.forEach(section => {
      section.items.forEach(item => {
        allItems[item.id] = true;
      });
    });
    setCheckedItems(allItems);
  };

  const handleUncheckAll = () => {
    setCheckedItems({});
  };

  const getTotalItems = () => {
    return checklistData.reduce((acc, section) => acc + section.items.length, 0);
  };

  const getCheckedCount = () => {
    return Object.values(checkedItems).filter(Boolean).length;
  };

  const exportToImage = async () => {
    const element = exportRef.current;
    if (!element) return;

    const pages = element.querySelectorAll('.export-page');
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const canvas = await html2canvas(page, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `checklist-page-${i + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // Split data into pages for export
  const splitIntoPages = () => {
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;
    const maxHeight = 12; // max items per page

    checklistData.forEach(section => {
      const sectionHeight = 1 + section.items.length;
      
      if (currentHeight + sectionHeight > maxHeight && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
      
      currentPage.push(section);
      currentHeight += sectionHeight;
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  };

  const pages = splitIntoPages();

  return (
    <div className="app">
      <div className="container">
        <h1>📋 Checklist เว็บแอปพลิเคชัน</h1>
        <p className="subtitle">ข้อกำหนด 1.1.4 - ความสามารถของเว็บแอปพลิเคชัน</p>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(getCheckedCount() / getTotalItems()) * 100}%` }}
          />
          <span className="progress-text">
            {getCheckedCount()} / {getTotalItems()} รายการ
          </span>
        </div>

        <div className="button-group">
          <button onClick={handleCheckAll} className="btn btn-success">
            ✓ เลือกทั้งหมด
          </button>
          <button onClick={handleUncheckAll} className="btn btn-secondary">
            ✗ ยกเลิกทั้งหมด
          </button>
          <button onClick={exportToImage} className="btn btn-primary">
            📷 Export เป็นภาพ
          </button>
        </div>

        <div className="checklist">
          {checklistData.map(section => (
            <div key={section.id} className="section">
              <h3 className="section-title">{section.title}</h3>
              {section.items.map(item => (
                <label key={item.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={checkedItems[item.id] || false}
                    onChange={() => handleCheck(item.id)}
                  />
                  <span className="checkmark"></span>
                  <span className="item-text">{item.text}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hidden export area */}
      <div ref={exportRef} className="export-container">
        {pages.map((pageData, pageIndex) => (
          <div key={pageIndex} className="export-page">
            <div className="export-header">
              <h2>📋 Checklist เว็บแอปพลิเคชัน</h2>
              <p>ข้อกำหนด 1.1.4 - หน้า {pageIndex + 1}/{pages.length}</p>
              <p className="export-date">วันที่: {new Date().toLocaleDateString('th-TH')}</p>
            </div>
            
            {pageData.map(section => (
              <div key={section.id} className="export-section">
                <div className="export-section-title">{section.title}</div>
                {section.items.map(item => (
                  <div key={item.id} className="export-item">
                    <span className={`export-checkbox ${checkedItems[item.id] ? 'checked' : ''}`}>
                      {checkedItems[item.id] ? '✓' : '○'}
                    </span>
                    <span className="export-text">{item.text}</span>
                  </div>
                ))}
              </div>
            ))}

            <div className="export-footer">
              <p>ผ่าน: {getCheckedCount()} / {getTotalItems()} รายการ</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
