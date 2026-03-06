import React, { useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

/**
 * Accordion - Expandable FAQ component with smooth open/close animation
 *
 * Features smooth height transitions using CSS and rotate animation on icon.
 *
 * @param {Object} props
 * @param {string} props.question - Question text
 * @param {string} props.answer - Answer HTML content
 * @param {string} [props.id] - Unique identifier for the accordion item
 * @param {string} [props.backgroundColor='primary'] - Background color variant (primary, gradient, white)
 * @param {boolean} [props.bordered=false] - Show border around accordion
 * @param {boolean} [props.defaultOpen=false] - Start in open state
 */
const Accordion = ({
  question,
  answer,
  id,
  backgroundColor = 'primary',
  bordered = false,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  return (
    <AccordionItem>
      <AccordionItemInner $bordered={bordered}>
        <QuestionButton
          $backgroundColor={backgroundColor}
          $isOpen={isOpen}
          $bordered={bordered}
          onClick={toggleAccordion}
          aria-expanded={isOpen}
          aria-controls={`answer-${id}`}
        >
          {question}
          <IconWrapper>
            <IconRotate $isOpen={isOpen}>
              <PlusIcon />
            </IconRotate>
          </IconWrapper>
        </QuestionButton>
        <AnswerWrapper
          id={`answer-${id}`}
          $isOpen={isOpen}
          $bordered={bordered}
        >
          <AnswerContent dangerouslySetInnerHTML={{ __html: answer }} />
        </AnswerWrapper>
      </AccordionItemInner>
    </AccordionItem>
  )
}

Accordion.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  id: PropTypes.string,
  backgroundColor: PropTypes.oneOf(['primary', 'gradient', 'white']),
  bordered: PropTypes.bool,
  defaultOpen: PropTypes.bool,
}

export default Accordion

// Styled Components
const AccordionItem = styled.div`
  display: block;
  width: 100%;
  margin-bottom: 12px;
`

const AccordionItemInner = styled.div`
  display: block;
  width: 100%;

  ${({ $bordered }) =>
    $bordered
      ? `
        border: 1px solid #BBC0C5;
        overflow: hidden;
        border-radius: 16px;
      `
      : ''}
`

const QuestionButton = styled.button`
  display: flex;
  width: 100%;
  padding: 20px;
  align-items: center;
  justify-content: space-between;
  background-color: #037dd6;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  color: #fff;
  border: none;
  border-radius: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 80px;
  text-align: left;
  cursor: pointer;
  transition: background-color 200ms ease;

  ${({ $bordered }) =>
    $bordered
      ? `
        border-radius: 0;
        border-bottom: 0;
      `
      : ''}

  ${({ $backgroundColor }) =>
    $backgroundColor === 'gradient'
      ? `
        background-image: linear-gradient(90deg, #9F6FF0 0%, #8A42AD 100%);
        font-weight: 400;
      `
      : ''}

  ${({ $backgroundColor }) =>
    $backgroundColor === 'white'
      ? `
        background-color: #fff;
        color: #000;

        svg path {
          fill: #000;
        }
      `
      : ''}

  ${({ $isOpen }) =>
    $isOpen
      ? `
      border-radius: 4px 4px 0 0;
    `
      : ''}

  &:hover {
    opacity: 0.9;
  }

  svg path {
    fill: #fff;
  }
`

const AnswerWrapper = styled.div`
  max-height: ${({ $isOpen }) => ($isOpen ? '2000px' : '0')};
  overflow: hidden;
  transition: max-height 500ms ease;
`

const AnswerContent = styled.div`
  border-radius: 0 0 4px 4px;
  display: block;
  padding: 30px;
  background: #f2f4f6;
  text-align: left;

  p:last-child {
    margin-bottom: 0;
  }

  a {
    color: #037dd6;
    text-decoration: underline;
  }

  ${({ $bordered }) =>
    $bordered
      ? `
        padding: 20px;
        padding-top: 0;
      `
      : ''}
`

const IconWrapper = styled.div`
  min-width: 24px;
  width: 24px;
  height: 24px;
  position: relative;
  margin-left: 8px;
`

const IconRotate = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 400ms ease;

  ${({ $isOpen }) => ($isOpen ? 'transform: rotate(45deg);' : '')}
`

// Simple Plus Icon SVG component
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 5V19M5 12H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
