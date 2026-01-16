// Re-export the common MXConnectWidget with inline mode for Register/Login pages
import MXConnectWidgetCommon from '../common/MXConnectWidget';

const MXConnectWidget = ({ 
  onSuccess, 
  onError, 
  onClose, 
  userGuid, 
  isVisible = true 
}) => {
  return (
    <MXConnectWidgetCommon
      onSuccess={onSuccess}
      onError={onError}
      onClose={onClose}
      userGuid={userGuid}
      isVisible={isVisible}
      inline={true} // Render inline for Register/Login pages
      userType="user"
    />
  );
};

export default MXConnectWidget;
