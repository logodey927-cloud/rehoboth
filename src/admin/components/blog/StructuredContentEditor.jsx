import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

/**
 * Structured Content Editor
 * Allows users to input content in a structured way without touching HTML
 * Supports two templates: "Article" and "Price List"
 */

// Helper function to escape HTML
const escapeHtml = (text) => {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

// Generate HTML for Article template
const generateArticleHtml = (data) => {
  let html = "";

  // Main title
  if (data.mainTitle) {
    html += `<h2>${escapeHtml(data.mainTitle)}</h2>\n`;
  }

  // Date text
  if (data.dateText) {
    html += `<p><strong>${escapeHtml(data.dateText)}</strong></p>\n`;
  }

  // Intro paragraph
  if (data.intro) {
    html += `<p>${escapeHtml(data.intro)}</p>\n`;
  }

  // Body paragraphs (before numbered sections)
  if (data.bodyParagraphs && data.bodyParagraphs.length > 0) {
    data.bodyParagraphs.forEach((para) => {
      if (para.trim()) {
        html += `<p>${escapeHtml(para)}</p>\n`;
      }
    });
  }

  // Numbered sections
  if (data.sections && data.sections.length > 0) {
    html += `<hr/>\n\n`;
    data.sections.forEach((section, index) => {
      if (section.heading && section.description) {
        const number = index + 1;
        html += `<h3>${number}. ${escapeHtml(section.heading)}</h3>\n`;
        html += `<p>${escapeHtml(section.description)}</p>\n\n`;
      }
    });
  }

  // Conclusion paragraph
  if (data.conclusion) {
    html += `<hr/>\n\n`;
    html += `<p>${escapeHtml(data.conclusion)}</p>\n`;
  }

  // Tags text
  if (data.tagsText) {
    html += `<p><strong>Tags:</strong> ${escapeHtml(data.tagsText)}</p>\n`;
  }

  return html;
};

// Generate HTML for Price List template
const generatePriceListHtml = (data) => {
  let html = "";

  // Main title
  if (data.mainTitle) {
    html += `<h2>${escapeHtml(data.mainTitle)}</h2>\n`;
  }

  // Subtitle and date
  if (data.subtitle || data.dateText) {
    html += `<p>`;
    if (data.subtitle) {
      html += `<strong>${escapeHtml(data.subtitle)}</strong>`;
    }
    if (data.dateText) {
      if (data.subtitle) html += `<br/>`;
      html += escapeHtml(data.dateText);
    }
    html += `</p>\n`;
  }

  // Intro paragraph
  if (data.intro) {
    html += `<p>${escapeHtml(data.intro)}</p>\n`;
  }

  // Sections with lists
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach((section) => {
      if (section.heading && section.items && section.items.length > 0) {
        html += `<hr/>\n\n`;
        html += `<h3>${escapeHtml(section.heading)}</h3>\n`;
        html += `<ul>\n`;
        section.items.forEach((item) => {
          if (item.label && item.details) {
            html += `  <li><strong>${escapeHtml(item.label)}</strong> — ${escapeHtml(item.details)}</li>\n`;
          }
        });
        html += `</ul>\n`;

        // Section note (like "Package choices include...")
        if (section.note) {
          html += `<p><strong>${escapeHtml(section.note)}</strong></p>\n`;
        }
      }
    });
  }

  // Note paragraph
  if (data.note) {
    html += `<hr/>\n\n`;
    const noteLines = data.note.split("\n").filter((line) => line.trim());
    html += `<p><strong>Note:</strong> `;
    noteLines.forEach((line, index) => {
      if (index > 0) html += `<br/>\n`;
      html += escapeHtml(line.trim());
    });
    html += `</p>\n`;
  }

  // Tags text
  if (data.tagsText) {
    html += `<p><strong>Tags:</strong> ${escapeHtml(data.tagsText)}</p>\n`;
  }

  return html;
};

// Parse HTML back to Article structure
const parseArticleHtml = (html) => {
  if (!html) return { mainTitle: "", dateText: "", intro: "", bodyParagraphs: [], sections: [], conclusion: "", tagsText: "" };

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const data = {
    mainTitle: "",
    dateText: "",
    intro: "",
    bodyParagraphs: [],
    sections: [],
    conclusion: "",
    tagsText: "",
  };

  // Find first numbered section (h2 or h3) to determine where body paragraphs end
  const allH2s = Array.from(tempDiv.querySelectorAll("h2"));
  const allH3s = Array.from(tempDiv.querySelectorAll("h3"));
  const firstNumberedSection = [...allH2s, ...allH3s]
    .find(h => /^\d+\./.test(h.textContent));
  
  // Find first h2 - if it's not a numbered section, it's the main title
  const firstH2 = tempDiv.querySelector("h2");
  if (firstH2 && !/^\d+\./.test(firstH2.textContent)) {
    data.mainTitle = firstH2.textContent.trim();
  }

  const strongP = Array.from(tempDiv.querySelectorAll("p")).find((p) => p.querySelector("strong") && !p.textContent.includes("Tags:"));
  if (strongP) {
    const strong = strongP.querySelector("strong");
    if (strong) data.dateText = strong.textContent.trim();
  }

  // Get all child elements in order to find where sections start
  const allElements = Array.from(tempDiv.children);
  
  // Find the index of the first numbered section in the DOM
  let firstSectionElementIndex = -1;
  if (firstNumberedSection) {
    firstSectionElementIndex = allElements.indexOf(firstNumberedSection);
  }

  // Process paragraphs in DOM order
  let introFound = false;
  
  allElements.forEach((element, elementIndex) => {
    // Stop processing if we've reached the first numbered section
    if (firstSectionElementIndex >= 0 && elementIndex >= firstSectionElementIndex) {
      return;
    }
    
    // Only process paragraph elements
    if (element.tagName !== "P") return;
    
    const p = element;
    
    // Skip date paragraph
    if (p.querySelector("strong") && !p.textContent.includes("Tags:")) return;
    
    // Skip tags paragraph
    if (p.textContent.includes("Tags:")) return;

    const text = p.textContent.trim();
    if (!text) return;

    if (!introFound) {
      // First non-date paragraph is intro
      data.intro = text;
      introFound = true;
    } else {
      // All subsequent paragraphs before sections are body paragraphs
      data.bodyParagraphs.push(text);
    }
  });

  // Numbered sections (check both h2 and h3)
  const h2s = tempDiv.querySelectorAll("h2");
  const h3s = tempDiv.querySelectorAll("h3");
  
  // Process h2 sections first (if they have numbers)
  h2s.forEach((h2) => {
    if (/^\d+\./.test(h2.textContent)) {
      const heading = h2.textContent.replace(/^\d+\.\s*/, "").trim();
      const nextP = h2.nextElementSibling;
      if (nextP && nextP.tagName === "P") {
        data.sections.push({
          heading: heading,
          description: nextP.textContent.trim(),
        });
      }
    }
  });
  
  // Process h3 sections
  h3s.forEach((h3) => {
    const heading = h3.textContent.replace(/^\d+\.\s*/, "").trim();
    const nextP = h3.nextElementSibling;
    if (nextP && nextP.tagName === "P") {
      data.sections.push({
        heading: heading,
        description: nextP.textContent.trim(),
      });
    }
  });

  // Conclusion (paragraph after last HR before tags)
  const lastHr = Array.from(tempDiv.querySelectorAll("hr")).pop();
  if (lastHr) {
    const conclusionP = lastHr.nextElementSibling;
    if (conclusionP && conclusionP.tagName === "P" && !conclusionP.textContent.includes("Tags:")) {
      data.conclusion = conclusionP.textContent.trim();
    }
  }

  // Tags
  const tagsP = Array.from(tempDiv.querySelectorAll("p")).find((p) => p.textContent.includes("Tags:"));
  if (tagsP) {
    data.tagsText = tagsP.textContent.replace(/^Tags:\s*/i, "").trim();
  }

  return data;
};

// Parse HTML back to Price List structure
const parsePriceListHtml = (html) => {
  if (!html) return { mainTitle: "", subtitle: "", dateText: "", intro: "", sections: [], note: "", tagsText: "" };

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const data = {
    mainTitle: "",
    subtitle: "",
    dateText: "",
    intro: "",
    sections: [],
    note: "",
    tagsText: "",
  };

  const h2 = tempDiv.querySelector("h2");
  if (h2) data.mainTitle = h2.textContent.trim();

  // Subtitle and date from first paragraph
  const firstP = tempDiv.querySelector("p");
  if (firstP) {
    const strong = firstP.querySelector("strong");
    if (strong) {
      data.subtitle = strong.textContent.trim();
      const br = firstP.querySelector("br");
      if (br) {
        data.dateText = firstP.textContent.split("\n").pop()?.trim() || "";
      }
    } else {
      data.dateText = firstP.textContent.trim();
    }
  }

  // Intro paragraph (second paragraph)
  const paragraphs = Array.from(tempDiv.querySelectorAll("p"));
  if (paragraphs.length > 1) {
    const introP = paragraphs[1];
    if (introP && !introP.textContent.includes("Tags:") && !introP.textContent.includes("Note:")) {
      data.intro = introP.textContent.trim();
    }
  }

  // Sections
  const sections = [];
  const h3s = tempDiv.querySelectorAll("h3");
  h3s.forEach((h3) => {
    const heading = h3.textContent.trim();
    const nextUl = h3.nextElementSibling;
    const items = [];

    if (nextUl && nextUl.tagName === "UL") {
      const lis = nextUl.querySelectorAll("li");
      lis.forEach((li) => {
        const strong = li.querySelector("strong");
        if (strong) {
          const label = strong.textContent.trim();
          const details = li.textContent.replace(strong.textContent, "").replace(/^—\s*/, "").trim();
          items.push({ label, details });
        }
      });
    }

    // Check for note after UL
    let note = "";
    if (nextUl) {
      const nextP = nextUl.nextElementSibling;
      if (nextP && nextP.tagName === "P" && nextP.querySelector("strong")) {
        note = nextP.textContent.trim();
      }
    }

    if (heading && items.length > 0) {
      sections.push({ heading, items, note });
    }
  });

  data.sections = sections;

  // Note paragraph
  const noteP = Array.from(tempDiv.querySelectorAll("p")).find((p) => p.textContent.includes("Note:"));
  if (noteP) {
    const noteText = noteP.textContent.replace(/^Note:\s*/i, "").trim();
    data.note = noteText;
  }

  // Tags
  const tagsP = Array.from(tempDiv.querySelectorAll("p")).find((p) => p.textContent.includes("Tags:"));
  if (tagsP) {
    data.tagsText = tagsP.textContent.replace(/^Tags:\s*/i, "").trim();
  }

  return data;
};

export default function StructuredContentEditor({ value, onChange, error }) {
  const [contentType, setContentType] = useState("article"); // "article" or "price-list"
  const [articleData, setArticleData] = useState({
    mainTitle: "",
    dateText: "",
    intro: "",
    bodyParagraphs: [],
    sections: [],
    conclusion: "",
    tagsText: "",
  });
  const [priceListData, setPriceListData] = useState({
    mainTitle: "",
    subtitle: "",
    dateText: "",
    intro: "",
    sections: [],
    note: "",
    tagsText: "",
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const skipNextUpdate = React.useRef(false);
  const previousValueRef = React.useRef(value);
  const hasInitializedWithContentRef = React.useRef(false);

  // Initialize from existing HTML
  useEffect(() => {
    // Check if value has changed
    const valueChanged = previousValueRef.current !== value;
    const wasEmpty = !previousValueRef.current || !previousValueRef.current.trim();
    const isNowNotEmpty = value && value.trim();
    
    // Initialize if:
    // 1. Not yet initialized AND value is defined, OR
    // 2. Value changed from empty to non-empty (content loaded after initial mount) AND we haven't initialized with content yet
    const shouldInitialize = 
      (!isInitialized && value !== undefined) || 
      (valueChanged && wasEmpty && isNowNotEmpty && !hasInitializedWithContentRef.current);
    
    if (shouldInitialize) {
      if (value && value.trim()) {
        // Try to detect type by checking structure
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = value;

        // Check for h2 or h3 numbered sections
        const h2s = tempDiv.querySelectorAll("h2");
        const h3s = tempDiv.querySelectorAll("h3");
        const hasNumberedSections = 
          (h2s.length > 0 && Array.from(h2s).some(h => /^\d+\./.test(h.textContent))) ||
          (h3s.length > 0 && Array.from(h3s).some(h => /^\d+\./.test(h.textContent)));
        const hasLists = tempDiv.querySelectorAll("ul").length > 0;

        skipNextUpdate.current = true; // Skip the HTML generation on initial load
        if (hasLists && !hasNumberedSections) {
          // Price list
          setContentType("price-list");
          setPriceListData(parsePriceListHtml(value));
        } else {
          // Article (or default)
          setContentType("article");
          setArticleData(parseArticleHtml(value));
        }
        hasInitializedWithContentRef.current = true;
      }
      setIsInitialized(true);
      previousValueRef.current = value;
    } else if (valueChanged) {
      // Update ref even if we don't re-initialize
      previousValueRef.current = value;
    }
  }, [value, isInitialized]);

  // Generate HTML whenever data changes (but not during initial load)
  useEffect(() => {
    if (!isInitialized || skipNextUpdate.current) {
      skipNextUpdate.current = false;
      return;
    }
    
    let html = "";
    if (contentType === "article") {
      html = generateArticleHtml(articleData);
    } else {
      html = generatePriceListHtml(priceListData);
    }
    if (onChange) {
      onChange(html);
    }
  }, [
    contentType, 
    articleData, 
    articleData.bodyParagraphs?.length, // Use length to detect array changes
    JSON.stringify(articleData.bodyParagraphs), // Stringify to detect content changes
    priceListData, 
    isInitialized, 
    onChange
  ]);

  const handleArticleChange = (field, value) => {
    setArticleData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceListChange = (field, value) => {
    setPriceListData((prev) => ({ ...prev, [field]: value }));
  };

  const addBodyParagraph = () => {
    setArticleData((prev) => ({
      ...prev,
      bodyParagraphs: [...prev.bodyParagraphs, ""],
    }));
  };

  const updateBodyParagraph = (index, value) => {
    setArticleData((prev) => {
      const newParagraphs = [...prev.bodyParagraphs];
      newParagraphs[index] = value;
      // Create a new object to ensure React detects the change
      return { ...prev, bodyParagraphs: [...newParagraphs] };
    });
  };

  const removeBodyParagraph = (index) => {
    setArticleData((prev) => ({
      ...prev,
      bodyParagraphs: prev.bodyParagraphs.filter((_, i) => i !== index),
    }));
  };

  const addArticleSection = () => {
    setArticleData((prev) => ({
      ...prev,
      sections: [...prev.sections, { heading: "", description: "" }],
    }));
  };

  const updateArticleSection = (index, field, value) => {
    setArticleData((prev) => {
      const newSections = [...prev.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      return { ...prev, sections: newSections };
    });
  };

  const removeArticleSection = (index) => {
    setArticleData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const moveArticleSection = (index, direction) => {
    setArticleData((prev) => {
      const newSections = [...prev.sections];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSections.length) return prev;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      return { ...prev, sections: newSections };
    });
  };

  const addPriceListSection = () => {
    setPriceListData((prev) => ({
      ...prev,
      sections: [...prev.sections, { heading: "", items: [], note: "" }],
    }));
  };

  const updatePriceListSection = (sectionIndex, field, value) => {
    setPriceListData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex] = { ...newSections[sectionIndex], [field]: value };
      return { ...prev, sections: newSections };
    });
  };

  const removePriceListSection = (sectionIndex) => {
    setPriceListData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== sectionIndex),
    }));
  };

  const addPriceListItem = (sectionIndex) => {
    setPriceListData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].items = [...(newSections[sectionIndex].items || []), { label: "", details: "" }];
      return { ...prev, sections: newSections };
    });
  };

  const updatePriceListItem = (sectionIndex, itemIndex, field, value) => {
    setPriceListData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].items[itemIndex] = {
        ...newSections[sectionIndex].items[itemIndex],
        [field]: value,
      };
      return { ...prev, sections: newSections };
    });
  };

  const removePriceListItem = (sectionIndex, itemIndex) => {
    setPriceListData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
      return { ...prev, sections: newSections };
    });
  };

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Content Type</InputLabel>
        <Select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          label="Content Type"
        >
          <MenuItem value="article">Article (Wellness-style)</MenuItem>
          <MenuItem value="price-list">Price List</MenuItem>
        </Select>
      </FormControl>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {contentType === "article" ? (
        <Box>
          <TextField
            fullWidth
            label="Main Title"
            value={articleData.mainTitle}
            onChange={(e) => handleArticleChange("mainTitle", e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Wellness Routine for Busy People"
          />

          <TextField
            fullWidth
            label="Date Text"
            value={articleData.dateText}
            onChange={(e) => handleArticleChange("dateText", e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., 5 October 2025"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Intro Paragraph"
            value={articleData.intro}
            onChange={(e) => handleArticleChange("intro", e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Brief introduction paragraph"
          />

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Body Paragraphs (before numbered sections)
          </Typography>
          {articleData.bodyParagraphs.map((para, index) => (
            <Box key={index} sx={{ mb: 2, display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={para}
                onChange={(e) => updateBodyParagraph(index, e.target.value)}
                placeholder="Body paragraph"
              />
              <IconButton onClick={() => removeBodyParagraph(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addBodyParagraph}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
          >
            Add Body Paragraph
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Numbered Sections
          </Typography>
          {articleData.sections.map((section, index) => (
            <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Section {index + 1}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  size="small"
                  onClick={() => moveArticleSection(index, "up")}
                  disabled={index === 0}
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => moveArticleSection(index, "down")}
                  disabled={index === articleData.sections.length - 1}
                >
                  <ArrowDownwardIcon />
                </IconButton>
                <IconButton size="small" onClick={() => removeArticleSection(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                label="Section Heading"
                value={section.heading}
                onChange={(e) => updateArticleSection(index, "heading", e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., Morning Hydration"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Section Description"
                value={section.description}
                onChange={(e) => updateArticleSection(index, "description", e.target.value)}
                placeholder="Description for this section"
              />
            </Paper>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addArticleSection}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
          >
            Add Numbered Section
          </Button>

          <Divider sx={{ my: 3 }} />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Conclusion Paragraph"
            value={articleData.conclusion}
            onChange={(e) => handleArticleChange("conclusion", e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Conclusion paragraph"
          />

          <TextField
            fullWidth
            label="Tags Text"
            value={articleData.tagsText}
            onChange={(e) => handleArticleChange("tagsText", e.target.value)}
            placeholder="e.g., wellness, habits, lifestyle"
          />
        </Box>
      ) : (
        <Box>
          <TextField
            fullWidth
            label="Main Title"
            value={priceListData.mainTitle}
            onChange={(e) => handlePriceListChange("mainTitle", e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Price List"
          />

          <TextField
            fullWidth
            label="Subtitle"
            value={priceListData.subtitle}
            onChange={(e) => handlePriceListChange("subtitle", e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Full Treatment Menu & Price List (2025)"
          />

          <TextField
            fullWidth
            label="Date Text"
            value={priceListData.dateText}
            onChange={(e) => handlePriceListChange("dateText", e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., 20 October 2025"
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Intro Paragraph"
            value={priceListData.intro}
            onChange={(e) => handlePriceListChange("intro", e.target.value)}
            sx={{ mb: 3 }}
            placeholder="Brief introduction"
          />

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Sections with Price Lists
          </Typography>
          {priceListData.sections.map((section, sectionIndex) => (
            <Paper
              key={sectionIndex}
              elevation={0}
              sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider" }}
            >
              <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Section {sectionIndex + 1}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  size="small"
                  onClick={() => removePriceListSection(sectionIndex)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <TextField
                fullWidth
                label="Section Heading"
                value={section.heading}
                onChange={(e) => updatePriceListSection(sectionIndex, "heading", e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., Massage Treatments"
              />

              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Items
              </Typography>
              {(section.items || []).map((item, itemIndex) => (
                <Box key={itemIndex} sx={{ mb: 2, display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Item Name (will be bold)"
                    value={item.label}
                    onChange={(e) => updatePriceListItem(sectionIndex, itemIndex, "label", e.target.value)}
                    placeholder="e.g., Swedish Massage"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Details"
                    value={item.details}
                    onChange={(e) => updatePriceListItem(sectionIndex, itemIndex, "details", e.target.value)}
                    placeholder="e.g., 60 min £70 • 30 min £40"
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={() => removePriceListItem(sectionIndex, itemIndex)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => addPriceListItem(sectionIndex)}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              >
                Add Item
              </Button>

              <TextField
                fullWidth
                label="Section Note (optional)"
                value={section.note || ""}
                onChange={(e) => updatePriceListSection(sectionIndex, "note", e.target.value)}
                placeholder="e.g., Package choices include: Swedish, Aromatherapy..."
                size="small"
              />
            </Paper>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addPriceListSection}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
          >
            Add Section
          </Button>

          <Divider sx={{ my: 3 }} />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Note Paragraph"
            value={priceListData.note}
            onChange={(e) => handlePriceListChange("note", e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Note text (can be multiple lines)"
          />

          <TextField
            fullWidth
            label="Tags Text"
            value={priceListData.tagsText}
            onChange={(e) => handlePriceListChange("tagsText", e.target.value)}
            placeholder="e.g., massage, facials, holistic, waxing, laser"
          />
        </Box>
      )}
    </Box>
  );
}

