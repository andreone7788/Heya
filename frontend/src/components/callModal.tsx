//FEDERICA - RENDER
//ANDREA - LOGICA

import { useTranslation } from "react-i18next";
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import PhoneDisabledRoundedIcon from '@mui/icons-material/PhoneDisabledRounded';

interface CallModalProps {
    callerName?: string
    isOpen: boolean;
    isIncoming?: boolean;
    onAccept?: () => void;
    onReject?: () => void;
    onEnd?: () => void;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export const CallModal = ({ callerName, isOpen, isIncoming = false, onAccept, onReject, onEnd, localVideoRef, remoteVideoRef }: CallModalProps) => {

    const { t } = useTranslation()

    if (!isOpen) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: '0',
                maxWidth: '100vw',
                width: '100%',
                minHeight: '100vh',
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 20,
                left:0,
                right:0,
                bottom:0
            }}
        >
            <div
                style={{
                    display: 'flex',
                minHeight: '100vh',
                maxWidth: '100vw',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center'
                }}
            >
                {isIncoming ? (
                    <div style={{ 
                         height:'auto',
                width: 'auto', 
                display: 'flex',
                flexDirection:'column',
                padding: '3em',
                backgroundColor: 'var(--ivory)',
                borderRadius: '50px',
                color: 'var(--camel)',
                textAlign: 'center',
                gap:'1.5em',
                margin: '0.5em',
                fontFamily: 'SATOSHI-VARIABLE',
                fontSize: '0.8em',
                        }}>
                        <h2 style={{ color: 'black' }}>{t('call.incoming')} {callerName ? ` "${callerName}"` : ""}</h2>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
                            <button
                                style={{
                                    background: 'green',
                                    color: 'white',
                                    padding: '21px 24px',
                                    border: 'none',
                                    borderRadius: '50%',
                                    fontSize: 18,
                                    cursor: 'pointer'
                                }}
                                onClick={onAccept}
                            >
                                <LocalPhoneRoundedIcon />
                            </button>
                            <button
                                style={{
                                    background: 'red',
                                    color: 'white',
                                    padding: '21px 24px',
                                    border: 'none',
                                    borderRadius: '50%',
                                    fontSize: 18,
                                    cursor: 'pointer'
                                }}
                                onClick={onReject}
                            >
                                <PhoneDisabledRoundedIcon />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Video remoto (grande) */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{
                                minHeight: '100vh',
                                minWidth: '100vw',
                                width: '100%',
                                backgroundColor: 'black',
                            }}
                        />

                        {/* Video locale (piccolo, sovrapposto) */}
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                width: '200px',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '30px'
                            }}
                        />

                        {/* Pulsante termina chiamata */}
                        <div>
                            <button
                                style={{
                                    position: 'absolute',
                                    bottom: '50px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'red',
                                    color: 'white',
                                    padding: '21px 24px',
                                    border: 'none',
                                    borderRadius: '50%',
                                    fontSize: 18,
                                    cursor: 'pointer'
                                }}
                                onClick={onEnd}
                            >
                                <PhoneDisabledRoundedIcon />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};