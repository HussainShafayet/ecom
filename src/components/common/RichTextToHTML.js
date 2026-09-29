// Text the shop owner wrote in the admin (already cleaned by the backend). It is theirs, so a phone must be able to read it:
// pictures never wider than the screen, a wide table scrolls sideways instead of pushing the page out.
const RichTextToHTML = ({ content }) => {
  return (
    <div
      className="max-w-full break-words [&_img]:h-auto [&_img]:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_iframe]:max-w-full"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextToHTML;
