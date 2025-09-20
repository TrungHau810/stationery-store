export const LoadingSpinner = ({ content }) => {
    return (
        <div className="flex justify-center items-center py-4">
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4"></div>
            </div>
            {content && <span className="ml-2">{content}</span>}
        </div>
    );
};
