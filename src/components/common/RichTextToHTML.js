const RichTextToHTML = ({ content }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextToHTML;
