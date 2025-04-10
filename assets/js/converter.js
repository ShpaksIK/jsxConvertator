const convertButton = document.getElementById('convertButton')
const copyJSXButton = document.getElementById('copyJSX')
const connectType = document.getElementById('connectType')
const enterType = document.getElementById('connectType_module')
const enterTypeMore = document.getElementById('connectType_more')
const textJSX = document.getElementById('textJSX')
const fileNameOutput = document.getElementById('fileNameOutput')

let classesType = 'standart'
let fileName = 'file'

const camelCase = (style) => {
    return style.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

const replaceClasses = (html) => {
    let nameClassName = document.getElementById('nameClassName').value.trim()
    nameClassName = nameClassName ? nameClassName : 'style'
    switch (classesType) {
        case 'standart':
            html = html.replace(/ class="(.*?)"/g, (_, className) => {
                const modifiedClassName = className.replace(/-/g, '_');
                return ` className="${modifiedClassName}"`;
            })
            break
        case 'module':
            html = html.replace(/ class="(.*?)"/g, (_, className) => {
                const modifiedClassName = className.replace(/-/g, '_');
                return ` className={${nameClassName}.${modifiedClassName}}`;
            })
            break
        case 'more':
            const inputTypeMore = document.getElementById('inputTypeMore')
            html = html.replace(/ class="(.*?)"/g, (_, className) => {
                const modifiedClassName = className.replace(/-/g, '_');
                return ` className=${inputTypeMore.value}`.replace('<class>', modifiedClassName);
            })
            break
    }
    return html
}

const replaceComments = (html) => {
    html = html.replace(/<!--(.*?)-->/g, (_, commentText) => {
        const modifiedComment = commentText.replace(/"/g, '\\"');
        return `{"${modifiedComment}"}`;
    })
    return html
}

const replaceStyles = (html) => {
    return html
        .replace(/ style="([^"]+)"/g, (match, styles) => {
            const jsxStyles = styles
                .split(';')
                .filter(style => style.trim() !== '')
                .map(style => {
                    const [property, value] = style.split(':').map(s => s.trim())
                    return `${camelCase(property)}: "${value}"`
                })
                .join(', ')
            return ` style={{${jsxStyles}}}`
        })
}

const convertHTMLToJSX = (textHtml) => {
    textHtml = replaceClasses(textHtml)
    textHtml = replaceComments(textHtml)
    textHtml = replaceStyles(textHtml)
    return textHtml
        .replace(/ for=/g, ' htmlFor=')
        .replace(/ onclick=/g, ' onClick=')
        .replace(/ ondblclick=/g, ' onDoubleClick=')
        .replace(/ onmousedown=/g, ' onMouseDown=')
        .replace(/ onmouseup=/g, ' onMouseUp=')
        .replace(/ onmouseover=/g, ' onMouseOver=')
        .replace(/ onmouseleave=/g, ' onMouseLeave=')
        .replace(/ onmouseenter=/g, ' onMouseEnter=')
        .replace(/ onfocus=/g, ' onFocus=')
        .replace(/ onblur=/g, ' onBlur=')
        .replace(/ aria-label=/g, ' ariaLabel=')
        .replace(/ aria-hidden=/g, ' ariaHidden=')
        .replace(/ data-([^=]+)/g, ' data-$1')
        .replace(/&nbsp;/g, '')
}

const createReactComponent = (jsx) => {
    return `import React from "react";

const Component = () => {
    ${jsx}
}

export default Component;`
}

connectType.addEventListener('change', () => {
    const selectType = connectType[connectType.options.selectedIndex].value
    classesType = selectType
    switch (selectType) {
        case 'standart':
            enterType.style.display = 'none'
            enterTypeMore.style.display = 'none'
            break
        case 'module':
            enterType.style.display = 'block'
            enterTypeMore.style.display = 'none'
            break
        case 'more':
            enterType.style.display = 'none'
            enterTypeMore.style.display = 'block'
            break
    } 
})

convertButton.addEventListener('click', () => {
    const textHtml = document.getElementById('textHtml').value
    textJSX.value = convertHTMLToJSX(textHtml)
})

copyJSXButton.addEventListener('click', () => {
    navigator.clipboard.writeText(textJSX.value);
})

document.getElementById('fileNameInput').addEventListener('input', (e) => {
    fileNameOutput.textContent = e.target.value
    fileName = e.target.value
    if (!e.target.value) {
        fileName = 'file'
        fileNameOutput.textContent = 'file'
    }
})

document.getElementById('downloadBtn').addEventListener('click', () => {
    const text = document.getElementById('textJSX').value
    if (text) {
        const fullComponentText = createReactComponent(text)
        const blob = new Blob([fullComponentText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName}.jsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
})